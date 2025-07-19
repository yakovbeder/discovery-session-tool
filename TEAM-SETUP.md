# Team Setup Guide

## 🚀 Quick Start for Team Members

### Option 1: One-Command Setup

```bash
curl -sSL https://raw.githubusercontent.com/yakovbeder/discovery-session-tool/main/setup-team.sh | bash
```

### Option 2: Manual Setup

```bash
# Clone the repository
git clone https://github.com/yakovbeder/discovery-session-tool.git

# Navigate to the directory
cd discovery-session-tool

# Start the server
python3 server.py
```

### Option 3: Direct File Access
```bash
# Clone and open directly
git clone https://github.com/yakovbeder/discovery-session-tool.git
cd discovery-session-tool

# macOS
open index.html

# Linux
xdg-open index.html
```

## 🌐 Access the Tool

- **Local server**: http://localhost:8000 (if using python server)
- **Direct file**: Open `index.html` in your browser

## 💾 Data Storage

- **Local data**: Your responses are saved in your browser's local storage
- **No conflicts**: Each team member has their own data
- **Custom questions**: Your custom questions are also saved locally
- **Export**: Use the export buttons to save your work as JSON or PDF

## 🔄 Updates

To get the latest version:
```bash
cd discovery-session-tool
git pull origin main
```

## 📋 Requirements

- **Python 3** (for local server)
- **Modern browser** (Chrome, Firefox, Safari, Edge)
- **Git** (for cloning)

## 🆕 New Features

- **Custom Questions**: Add your own questions to any section
- **Collapsible Sections**: Click section headers to expand/collapse
- **Sticky Progress Bar**: Progress indicator appears when scrolling
- **Enhanced PDF Export**: Includes subject information for better organization

## 🐚 Shell Compatibility

The setup script works with:
- **bash** (default on most Linux systems)
- **zsh** (default on macOS Catalina+)
- **fish** (modern shell)

## 🆘 Troubleshooting

**Port 8000 already in use?**
```bash
# Kill existing process
lsof -ti:8000 | xargs kill -9
```

**Python not found?**
```bash
# macOS
brew install python3

# Ubuntu/Debian
sudo apt install python3
```

---

**Happy Discovery Session Planning! 🎯** 