# OpenShift Discovery Session Tool

A modern, interactive web-based checklist tool for conducting OpenShift discovery sessions. This tool helps teams systematically gather and document requirements for OpenShift deployments.

## Features

### 🎯 Core Functionality
- **Interactive Checklist**: Complete discovery session checklist with 10 major sections
- **Real-time Progress Tracking**: Visual progress bar showing completion percentage
- **Auto-save**: Automatically saves data every 30 seconds to prevent loss
- **Responsive Design**: Works seamlessly on desktop, tablet, and mobile devices

### 💾 Data Management
- **Local Storage**: Data is automatically saved to browser's local storage
- **Import/Export**: Load and save data as JSON files
- **PDF Export**: Generate professional PDF reports for sharing
- **Clear All**: Reset all fields with confirmation dialog

### ⌨️ User Experience
- **Keyboard Shortcuts**:
  - `Ctrl/Cmd + S`: Save data
  - `Ctrl/Cmd + O`: Load data
  - `Ctrl/Cmd + P`: Export to PDF
- **Toast Notifications**: Real-time feedback for all actions
- **Floating Action Buttons**: Quick access to common functions
- **Modern UI**: Clean, professional interface using Tailwind CSS

## Sections Covered

1. **Project Scope & Cluster Usage**
   - Number of clusters required
   - Cluster purposes and designations

2. **Platform Architecture & Design**
   - Installation method (IPI/UPI)
   - OCP version selection
   - Node composition and breakdown
   - High availability and etcd requirements

3. **Hardware & Operating System**
   - Hardware specifications and growth expectations
   - RHCOS awareness for nodes
   - RHEL version for bastion server

4. **Networking & Load Balancing**
   - SDN network configuration (default CIDR examples provided)
   - DNS configuration
   - Ingress with TLS termination preferences
   - Load balancing options
   - External component connectivity

5. **Storage Architecture**
   - Available storage options (NetApp, ODF)
   - S3 compatibility requirements

6. **Security & Compliance**
   - Authentication providers (LDAP/AD, LDAPS, SSO)
   - Authorization (Local users, AD groups, RBAC)
   - Network policies requirements
   - Security hardening and compliance
   - Service Mesh for mTLS

7. **Image Management (Disconnected Environment)**
   - Disconnected installation confirmation
   - Image registry strategy (local bastion, external Quay/JFrog/Harbor)

8. **Observability (Monitoring & Logging)**
   - Built-in monitoring awareness
   - User workload monitoring needs
   - Alert forwarding requirements
   - Cluster logging components
   - Log forwarding requirements
   - Distributed tracing (Tempo/Jaeger)

9. **Platform Operations & Lifecycle**
   - Node management procedures
   - Upgrade strategies
   - NTP requirements
   - Backup and restore procedures

10. **Automation & Integration**
    - CI/CD tool integration
    - GitOps implementation
    - ACM management cluster consideration

## Usage

### For Team Members (Recommended)
Each team member should run the tool locally to avoid data conflicts:

```bash
# Quick setup (run this once)
curl -sSL https://raw.githubusercontent.com/yakovbeder/discovery-session-tool/main/setup-team.sh | bash

# Or manually:
git clone https://github.com/yakovbeder/discovery-session-tool.git
cd discovery-session-tool
python3 server.py
```

Then open: **http://localhost:8000**

### For Demo/Presentation
Visit the live version at: **https://yakovbeder.github.io/discovery-session-tool/**
*Note: This is for demonstration only - data is shared between all users*

### Local Development
1. Open `index.html` in a modern web browser
2. Start filling out the checklist sections
3. Data is automatically saved as you type

### Saving and Loading
- **Auto-save**: Data is automatically saved every 30 seconds
- **Manual Save**: Click the "Save" button or use `Ctrl/Cmd + S`
- **Load Data**: Click "Load" to import a previously saved JSON file
- **Export**: Use "Export JSON" to download your data as a file

### Exporting Reports
- **PDF Export**: Click "Export PDF" to generate a printable report
- **JSON Export**: Click "Export JSON" to download data for backup or sharing

### Keyboard Shortcuts
| Shortcut | Action |
|----------|--------|
| `Ctrl/Cmd + S` | Save data |
| `Ctrl/Cmd + O` | Load data |
| `Ctrl/Cmd + P` | Export to PDF |

## File Structure

```
discovery-session-tool/
├── index.html          # Main application
├── script.js           # JavaScript functionality
├── server.py           # Python HTTP server
├── start.sh            # Quick start script
├── package.json        # Project metadata
├── README.md           # This documentation
├── QUICKSTART.md       # Quick start guide
└── .gitignore          # Git ignore rules
```

## Technical Details

### Browser Compatibility
- Chrome 60+
- Firefox 55+
- Safari 12+
- Edge 79+

### Dependencies
- **Tailwind CSS**: For styling (loaded via CDN)
- **Font Awesome**: For icons (loaded via CDN)
- **Google Fonts**: Inter font family (loaded via CDN)

### Data Storage
- Uses browser's `localStorage` for automatic data persistence
- JSON format for import/export functionality
- No server required - runs entirely in the browser

## Customization

### Adding New Sections
To add new sections to the checklist:

1. Add the HTML structure in `index.html`
2. Update the `sections` array in `script.js` (generatePDFHTML method)
3. Add questions to the `questions` object in `script.js`

### Styling
The tool uses Tailwind CSS classes. You can customize the appearance by:
- Modifying the CSS in the `<style>` section of `index.html`
- Adding custom Tailwind classes
- Overriding specific component styles

## Contributing

To contribute to this tool:

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## License

This tool is provided as-is for educational and professional use. Feel free to modify and distribute as needed.

## Support

For issues or questions:
1. Check the browser console for error messages
2. Ensure you're using a supported browser
3. Try clearing browser cache and local storage
4. Verify all files are present in the directory

---

**Note**: This tool is designed for OpenShift discovery sessions and follows Red Hat's best practices for OpenShift deployment planning. 