AREOLA | PROTOTYPE
Advanced Fraud Analysis Model & Command Center
AREOLA is a high-performance forensic auditing suite designed to detect financial anomalies, transaction artifacts, and exposure risks in large-scale datasets. Built with a minimalist, high-contrast interface, it provides a "Command Center" experience for deep-dive financial investigations.
________________________________________
⚡ Key Features
•	Real-Time Forensic Sweep: Instant analysis of transaction signatures to identify high-risk anomalies.
•	Dynamic Exposure Tracking: Live calculation of "Total at Risk" and "Average Theft" metrics.
•	Raw Audit Panel: A slide-out inspection deck for immediate verification of artifact patterns.
•	Comprehensive Auditor Interface: A dedicated deep-dive view with advanced filtering by signature, amount, or artifact type.
•	Persistent Intelligence: State-management that ensures audit data remains consistent across the session.
🛠️ The Tech Stack
•	Frontend: Next.js 14+ (App Router), Tailwind CSS
•	Backend: Python / FastAPI (Forensic Intelligence Engine)
•	Styling: Bespoke minimalist UI with high-contrast typography
•	Icons: Lucide React
🚀 Getting Started
Note: The full dataset (creditcard.csv) is excluded due to file size limits. Please place your own  dataset in the root directory before running the model. or you can get the dataset from kaggle
1.	Clone the repository:
Bash
git clone https://github.com/your-username/areola-forensic.git
2.	Install Dependencies:
npm install
# and for the backend
pip install -r requirements.txt
3.	Run the UI:
# Start the frontend in
cd areola
npm run dev

# Start the FastAPI server (in a separate terminal)
python api.py
📂 Project Structure
•	/app: Next.js layouts and page routes (The "Intelligence" layer)
•	/components: Custom forensic UI modules (Sidebar, Audit Tables, Stat Cards)
•	/public: Static assets and forensic artifacts
•	main.py: The core FastAPI logic handling the anomaly detection model
________________________________________
Developed by Nmesoma 

