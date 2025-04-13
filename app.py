from flask import Flask, request, jsonify, render_template
from flask_cors import CORS
import pandas as pd
from dotenv import load_dotenv
from groq import Groq
import os
import textwrap

load_dotenv()
GROQ_API_KEY = os.getenv("GROQ_API_KEY")
client = Groq(api_key=GROQ_API_KEY)

# Load the dataset
df = pd.read_csv("players_fifa23.csv")

# Standardize column names (if needed)
df.columns = df.columns.str.strip()

# Swap 'Name' and 'FullName' if 'FullName' contains a dot (.)
mask = df["FullName"].str.contains(".", regex=False)
df.loc[mask, ["Name", "FullName"]] = df.loc[mask, ["FullName", "Name"]].values

# Save the cleaned dataset (optional)
df.to_csv("players_fifa23_processed.csv", index=False)

print(df[["Name", "FullName"]].head())  # Check results


app = Flask(__name__)
CORS(app)  # Enable CORS to allow frontend requests

# Load Player Data
df = pd.read_csv("players_fifa23_processed.csv")

@app.route('/')
def home():
    """Render the main webpage."""
    return render_template('index.html')

@app.route('/autocomplete', methods=['GET'])
def autocomplete():
    """Return player name suggestions based on user input."""
    query = request.args.get('q', '').lower()
    suggestions = df[df["FullName"].str.lower().str.contains(query, na=False)]["FullName"].tolist()
    return jsonify(suggestions[:10])  # Return top 10 suggestions

def wrap_text(text, width=80):
    return "\n".join(textwrap.wrap(text, width))

@app.route('/compare', methods=['GET'])
def compare_players():
    player1 = request.args.get("player1")
    player2 = request.args.get("player2")

    if not player1 or not player2:
        return jsonify({"error": "Missing player names"}), 400

    attributes = ["PaceTotal","ShootingTotal","PassingTotal","DribblingTotal","DefendingTotal","PhysicalityTotal"]

    player1_data = df[df["FullName"] == player1][["FullName"] + attributes].to_dict(orient="records")
    player2_data = df[df["FullName"] == player2][["FullName"] + attributes].to_dict(orient="records")

    if not player1_data or not player2_data:
        return jsonify({"error": "Player data not found"}), 404

    stats = {
        "player1": {attr: player1_data[0].get(attr, 0) for attr in attributes},
        "player2": {attr: player2_data[0].get(attr, 0) for attr in attributes},
    }

    prompt = f"""
    First provide a 2-line general comparison between these 2 footballers, then compare them **pointwise**:

    Player1- {player1}  
    Player2- {player2}  

    Provide a structured, pointwise comparison.
    """

    try:
        chat_completion = client.chat.completions.create(
            messages=[{"role": "user", "content": prompt}],
            model="llama3-8b-8192",
            max_tokens=500
        )

        response_text = chat_completion.choices[0].message.content
        return jsonify({"comparison": response_text, "stats": stats})

    except Exception as e:
        return jsonify({"error": str(e)}), 500

if __name__ == '__main__':
    app.run(debug=True)
