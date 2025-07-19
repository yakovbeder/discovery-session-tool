# Quick Start Guide

## 🚀 Get Started in 30 Seconds

### Option 1: Simple Start (Recommended)
```bash
# Navigate to the tool directory
cd discovery-session-tool

# Start the server
./start.sh
```

### Option 2: Manual Start
```bash
# Navigate to the tool directory
cd discovery-session-tool

# Start with Python 3
python3 server.py

# OR start with Python
python server.py
```

### Option 3: Direct File Access
Simply open `index.html` in your web browser (no server required, but some features may be limited).

## 🌐 Access the Tool

Once the server is running, open your browser and go to:
**http://localhost:8000/index.html**

## ✨ Key Features to Try

1. **Fill out any section** - Data auto-saves every 30 seconds
2. **Add custom questions** - Click "Add Question" buttons in any section
3. **Watch the progress bar** - See completion percentage in real-time
4. **Use keyboard shortcuts**:
   - `Ctrl/Cmd + S` - Save
   - `Ctrl/Cmd + O` - Load
   - `Ctrl/Cmd + P` - Export PDF
5. **Export your work** - Try the PDF and JSON export buttons
6. **Floating buttons** - Use the floating action buttons for quick access
7. **Collapsible sections** - Click section headers to expand/collapse

## 🛑 Stop the Server

Press `Ctrl+C` in the terminal where the server is running.

## 📁 File Structure

```
discovery-session-tool/
├── index.html          # Main application
├── script.js           # All functionality
├── server.py           # Python HTTP server
├── start.sh            # Quick start script
├── package.json        # Project metadata
├── README.md           # Full documentation
└── QUICKSTART.md       # This file
```

## 🔧 Troubleshooting

**Port 8000 already in use?**
```bash
# Kill existing process on port 8000
lsof -ti:8000 | xargs kill -9

# OR use a different port by editing server.py
```

**Python not found?**
```bash
# Install Python 3
# macOS: brew install python3
# Ubuntu: sudo apt install python3
# Windows: Download from python.org
```

**Browser issues?**
- Try a different browser
- Clear browser cache
- Check browser console for errors

## 📞 Need Help?

1. Check the full [README.md](README.md) for detailed documentation
2. Ensure all files are present in the directory
3. Try opening `index.html` directly in the browser
4. Check browser console for error messages

---

**Happy Discovery Session Planning! 🎯** 