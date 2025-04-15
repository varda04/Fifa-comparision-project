FIFA Player Showdown
⚽ FIFA Player Showdown allows users to compare two football players based on their statistics, showcasing a radar chart and side-by-side stats summary. This project is a full-stack web application built using HTML, CSS, JavaScript, and Groq for processing player comparison data.

Project Overview
This project provides a platform for users to compare two football players, such as Lionel Messi and Cristiano Ronaldo. It utilizes dynamic charts, interactive features, and a clean user interface to display the comparison results. The project is designed to be fully responsive and easily customizable.

Features:
Player Comparison: Compare two football players based on stats like goals, speed, style of play, etc.

Radar Chart: Visualize player stats in a radar chart using Chart.js.

Interactive Input: Users can type player names and instantly see comparison results.

Dynamic Content: The comparison data is fetched from Groq, formatted, and displayed on the page.

Technologies Used
Frontend: HTML, CSS, JavaScript

Charting: Chart.js

Data Processing: Groq

Backend: Python Flask (for API to fetch player data)

Static Files: Images, CSS, JavaScript files served via Flask

Setup Instructions
Follow these steps to set up and run this project locally.

Prerequisites
Make sure you have the following installed:

Python 3.x

Flask

A code editor like Visual Studio Code

Installation
Clone the repository:

bash
Copy
Edit
git clone https://github.com/your-username/fifa-player-showdown.git
Navigate into the project directory:

bash
Copy
Edit
cd fifa-player-showdown
Install the required dependencies:

bash
Copy
Edit
pip install -r requirements.txt
Start the Flask server:

bash
Copy
Edit
python app.py
Open your browser and go to:

bash
Copy
Edit
http://127.0.0.1:5000
Static Assets
The project contains static assets like images and stylesheets, served by Flask. These files are placed in the /static folder.
