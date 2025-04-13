document.addEventListener("DOMContentLoaded", function() {
    setupAutocomplete("player1", "suggestions1");
    setupAutocomplete("player2", "suggestions2");
});

function setupAutocomplete(inputId, suggestionsId) {
    let input = document.getElementById(inputId);
    let suggestionsBox = document.getElementById(suggestionsId);

    input.addEventListener("input", function() {
        let query = input.value;
        if (query.length < 2) {
            suggestionsBox.innerHTML = "";
            suggestionsBox.classList.remove("visible");
            return;
        }

        fetch(`/autocomplete?q=${query}&field=FullName`)
            .then(response => response.json())
            .then(data => {
                suggestionsBox.innerHTML = data.map(fullname => 
                    `<li onclick="selectPlayer('${inputId}', '${fullname}')">${fullname}</li>`
                ).join("");

                // Set position of the suggestions box
                const rect = input.getBoundingClientRect();
                suggestionsBox.style.top = `${rect.bottom + window.scrollY}px`; // Position right below the input field
                suggestionsBox.style.left = `${rect.left + window.scrollX}px`; // Align with the left side of the input field
                
                suggestionsBox.classList.add("visible");
            });
    });
}

function selectPlayer(inputId, fullname) {
    document.getElementById(inputId).value = fullname;
    document.getElementById(inputId.replace("player", "suggestions")).innerHTML = "";
    document.getElementById(inputId.replace("player", "suggestions")).classList.remove("visible");
}

async function comparePlayers() {
    let player1 = document.getElementById("player1").value;
    let player2 = document.getElementById("player2").value;

    if (!player1 || !player2) {
        alert("Please enter both player names.");
        return;
    }

    try {
        let response = await fetch(`/compare?player1=${player1}&player2=${player2}`);
        let data = await response.json();

        if (data.error) {
            document.getElementById("comparisonResult").innerHTML = `<p>${data.error}</p>`;
            return;
        }

        // Extract radar chart values
        let attributes = ["PaceTotal","ShootingTotal","PassingTotal","DribblingTotal","DefendingTotal","PhysicalityTotal"];
        let player1Stats = data.stats.player1;
        let player2Stats = data.stats.player2;

        let player1Values = attributes.map(attr => player1Stats[attr] || 0);
        let player2Values = attributes.map(attr => player2Stats[attr] || 0);

        // Render radar chart
        renderRadarChart(player1, player2, attributes, player1Values, player2Values);

        // Show AI-generated summary **after** radar chart
        document.getElementById("comparisonResult").innerHTML = `<h2>AI Summary</h2><p>${data.comparison}</p>`;
        if (document.getElementById("voiceToggle").checked) {
            speakCommentary(data.comparison);
        }        

    } catch (error) {
        console.error("Error fetching data:", error);
        document.getElementById("comparisonResult").innerHTML = "<p>Something went wrong.</p>";
    }
}

// Function to render the radar chart
function renderRadarChart(player1, player2, labels, player1Values, player2Values) {
    let ctx = document.getElementById("radarChart").getContext("2d");

    if (window.radarChart instanceof Chart) {
        window.radarChart.destroy();
    }

    window.radarChart = new Chart(ctx, {
        type: "radar",
        data: {
            labels: labels,
            datasets: [
                {
                    label: player1,
                    data: player1Values,
                    borderColor: "blue",
                    backgroundColor: "rgba(0, 0, 255, 0.2)",
                    pointBackgroundColor: "blue",
                },
                {
                    label: player2,
                    data: player2Values,
                    borderColor: "red",
                    backgroundColor: "rgba(255, 0, 0, 0.2)",
                    pointBackgroundColor: "red",
                }
            ]
        },
        options: {
            responsive: true,
            scales: {
                r: {
                    suggestedMin: 0,
                    suggestedMax: 100
                }
            }
        }
    });
}


function cleanData(text) {
    return text
        .replace(/\*\*/g, "")  // Remove bold formatting
        .replace(/(?<=\bComparison)\s/g, "<br><br>") // Add breaks after 'Comparison' sections
        .replace(/\*\s/g, "<br>• ") // Convert bullet points (*) to proper list format
        .replace(/\n/g, "<br>") // Convert new lines to HTML line breaks
        .trim();
}

function speakCommentary(text) {
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.rate = 1; // Normal speed
    utterance.pitch = 1; // Normal pitch
    utterance.lang = 'en-US'; // Set to English (US)
    speechSynthesis.speak(utterance);
}
