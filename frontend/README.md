# Online Learning Platform - Frontend

## 📁 Project Structure

```
frontend/
├── index.html              # Main entry page (redirects to login)
├── config.js              # Frontend configuration
├── README.md              # Project documentation
├── assets/                # Static resources
│   ├── icons/            # Icon files
│   │   └── favicon.ico   # Website icon
│   └── images/           # Image resources
├── components/            # Reusable components
│   ├── header.html       # Header component
│   └── footer.html       # Footer component
├── css/                  # Stylesheets
│   └── style.css         # Main stylesheet
├── js/                   # JavaScript files
│   ├── auth.js           # Authentication logic
│   └── dashboard.js      # Dashboard logic
└── pages/                # Page files
    ├── index.html        # Login page
    ├── register.html     # Registration page
    └── dashboard.html    # Dashboard page
```

## 🚀 Quick Start

### Start Frontend Server

```bash
cd frontend
python3 -m http.server 8000
```

### Access URLs

- **Home**: http://localhost:8000
- **Login**: http://localhost:8000/pages/index.html
- **Register**: http://localhost:8000/pages/register.html
- **Dashboard**: http://localhost:8000/pages/dashboard.html

## 🎨 Tech Stack

- **HTML5** - Page structure
- **CSS3** - Styling
- **Vanilla JavaScript** - Frontend logic
- **Python HTTP Server** - Local development server

## 📋 Features

### ✅ Implemented

- User login/registration
- Responsive design
- Error handling
- Loading states
- Local storage management

### 🚧 In Development

- Course management
- Learning progress tracking
- User dashboard
- Real-time notifications

## 🔧 Configuration

### API Configuration

Modify API address in `config.js`:

```javascript
API_BASE_URL: "http://localhost:3761/api";
```

### Routes Configuration

```javascript
ROUTES: {
    LOGIN: '/pages/index.html',
    REGISTER: '/pages/register.html',
    DASHBOARD: '/pages/dashboard.html'
}
```

## 📝 Development Guide

### Adding New Pages

1. Create HTML file in `pages/` directory
2. Update routes in `config.js`
3. Add corresponding styles and scripts

### Adding New Components

1. Create component file in `components/` directory
2. Reference component in pages
3. Add component styles

## 🐛 Troubleshooting

### Common Issues

1. **Page not accessible**: Check if server is running
2. **API requests fail**: Verify backend server on correct port
3. **Styles not loading**: Check CSS file paths

### Debug Tips

- Use browser developer tools
- Check console error messages
- Verify network request status

## 📄 License

MIT License

---

_Last updated: July 2024_
