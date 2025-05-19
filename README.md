# Bug Blaster 🐞

A fun, fast-paced web shooter game where players defend a digital lab from invading bugs! Built with Django and JavaScript.

## Features

* 🎯 Mouse or tap-to-shoot interface
* ⏱️ 60-second timed gameplay
* 🐞 Three types of bugs with different behaviors:
  * Basic Bug (1 point)
  * Fast Bug (3 points)
  * Armored Bug (5 points, takes 2 hits)
* 📊 Score tracking and leaderboard
* 👤 User authentication

## How to Play

1. Log in to your account
2. Click the "Start Game" button
3. Click on bugs to shoot them:
   * Green bugs: 1 point
   * Red bugs: 3 points
   * Blue bugs: 5 points (requires 2 hits)
4. Try to get the highest score in 60 seconds!

## Technologies Used

* Backend: Django
* Frontend: HTML5 Canvas, JavaScript
* Styling: Bootstrap 5, CSS3
* Database: SQLite (default)

## Installation

1. Clone the repository:
```bash
git clone https://github.com/pranavpwr/BugBlaster.git
cd BugBlaster
```

2. Create and activate a virtual environment:
```bash
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate
```

3. Install dependencies:
```bash
pip install -r requirements.txt
```

4. Run migrations:
```bash
python manage.py migrate
```

5. Start the development server:
```bash
python manage.py runserver
```

6. Visit http://127.0.0.1:8000 in your browser

## Contributing

Feel free to submit issues and enhancement requests!
