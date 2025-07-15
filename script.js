// Discovery Session Tool JavaScript
class DiscoverySessionTool {
    constructor() {
        this.data = {};
        this.init();
    }

    init() {
        this.loadFromLocalStorage();
        this.setupEventListeners();
        this.updateProgress();
        this.setupAutoSave();
        this.setupCollapsibleSections();
        this.setupStickyProgress();
    }

    setupEventListeners() {
        // Add event listeners to all textareas
        const textareas = document.querySelectorAll('textarea');
        textareas.forEach(textarea => {
            textarea.addEventListener('input', () => {
                this.saveToLocalStorage();
                this.updateProgress();
            });
        });

        // Add keyboard shortcuts
        document.addEventListener('keydown', (e) => {
            if (e.ctrlKey || e.metaKey) {
                switch (e.key) {
                    case 's':
                        e.preventDefault();
                        this.saveData();
                        break;
                    case 'o':
                        e.preventDefault();
                        this.loadData();
                        break;
                    case 'p':
                        e.preventDefault();
                        this.exportToPDF();
                        break;
                }
            }
        });
    }

    setupAutoSave() {
        // Auto-save every 30 seconds
        setInterval(() => {
            this.saveToLocalStorage();
        }, 30000);
    }

    collectData() {
        const data = {
            timestamp: new Date().toISOString(),
            version: '1.0',
            sections: {}
        };

        const textareas = document.querySelectorAll('textarea');
        textareas.forEach(textarea => {
            const fieldName = textarea.getAttribute('data-field');
            if (fieldName) {
                const [section, type] = fieldName.split('-');
                if (!data.sections[section]) {
                    data.sections[section] = {};
                }
                data.sections[section][type] = textarea.value;
            }
        });

        return data;
    }

    populateData(data) {
        if (!data || !data.sections) return;

        const textareas = document.querySelectorAll('textarea');
        textareas.forEach(textarea => {
            const fieldName = textarea.getAttribute('data-field');
            if (fieldName) {
                const [section, type] = fieldName.split('-');
                if (data.sections[section] && data.sections[section][type]) {
                    textarea.value = data.sections[section][type];
                }
            }
        });
    }

    saveToLocalStorage() {
        const data = this.collectData();
        localStorage.setItem('discoverySessionData', JSON.stringify(data));
    }

    loadFromLocalStorage() {
        const savedData = localStorage.getItem('discoverySessionData');
        if (savedData) {
            try {
                const data = JSON.parse(savedData);
                this.populateData(data);
                this.showToast('Data loaded from local storage', 'success');
            } catch (error) {
                console.error('Error loading data:', error);
                this.showToast('Error loading saved data', 'error');
            }
        }
    }

    updateProgress() {
        const textareas = document.querySelectorAll('textarea');
        let completedFields = 0;
        let totalFields = 0;

        textareas.forEach(textarea => {
            totalFields++;
            if (textarea.value.trim() !== '') {
                completedFields++;
            }
        });

        const percentage = totalFields > 0 ? Math.round((completedFields / totalFields) * 100) : 0;
        
        // Update main progress bar
        const progressFill = document.getElementById('progress-fill');
        const completionText = document.getElementById('completion-text');
        
        progressFill.style.width = `${percentage}%`;
        completionText.textContent = `${percentage}% Complete`;

        // Update sticky progress bar
        const stickyProgressFill = document.getElementById('sticky-progress-fill');
        const stickyCompletionText = document.getElementById('sticky-completion-text');
        
        if (stickyProgressFill && stickyCompletionText) {
            stickyProgressFill.style.width = `${percentage}%`;
            stickyCompletionText.textContent = `${percentage}% Complete`;
        }

        // Update progress bar color based on completion
        const progressBars = [progressFill, stickyProgressFill];
        progressBars.forEach(bar => {
            if (bar) {
                if (percentage < 25) {
                    bar.style.backgroundColor = '#ef4444'; // red
                } else if (percentage < 50) {
                    bar.style.backgroundColor = '#f59e0b'; // yellow
                } else if (percentage < 75) {
                    bar.style.backgroundColor = '#3b82f6'; // blue
                } else {
                    bar.style.backgroundColor = '#10b981'; // green
                }
            }
        });
    }

    saveData() {
        this.saveToLocalStorage();
        this.showToast('Data saved successfully!', 'success');
    }

    loadData() {
        const input = document.createElement('input');
        input.type = 'file';
        input.accept = '.json';
        input.onchange = (e) => {
            const file = e.target.files[0];
            if (file) {
                const reader = new FileReader();
                reader.onload = (e) => {
                    try {
                        const data = JSON.parse(e.target.result);
                        this.populateData(data);
                        this.updateProgress();
                        this.showToast('Data loaded successfully!', 'success');
                    } catch (error) {
                        console.error('Error parsing file:', error);
                        this.showToast('Error loading file. Please check the file format.', 'error');
                    }
                };
                reader.readAsText(file);
            }
        };
        input.click();
    }

    exportToJSON() {
        const data = this.collectData();
        const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `discovery-session-${new Date().toISOString().split('T')[0]}.json`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
        this.showToast('Data exported to JSON successfully!', 'success');
    }

    exportToPDF() {
        // Create a new window for PDF generation
        const printWindow = window.open('', '_blank');
        const data = this.collectData();
        
        const htmlContent = this.generatePDFHTML(data);
        
        printWindow.document.write(htmlContent);
        printWindow.document.close();
        
        // Wait for content to load then print
        printWindow.onload = () => {
            // Set print options to remove headers/footers
            const printOptions = {
                silent: false,
                printBackground: true,
                color: true,
                margin: {
                    marginType: 'custom',
                    top: 0.4,
                    bottom: 0.4,
                    left: 0.4,
                    right: 0.4
                },
                landscape: false,
                pagesPerSheet: 1,
                collate: false,
                copies: 1,
                header: '',
                footer: ''
            };
            
            // Try to use advanced print options if available
            if (printWindow.print) {
                printWindow.print();
            } else {
                // Fallback to basic print
                printWindow.document.execCommand('print');
            }
            
            // Close window after a short delay
            setTimeout(() => {
                printWindow.close();
            }, 1000);
        };
        
        this.showToast('PDF export initiated!', 'info');
    }

    generatePDFHTML(data) {
        const sections = [
            { title: '1. Project Scope & Cluster Usage', items: ['1.1', '1.2'] },
            { title: '2. Platform Architecture & Design', items: ['2.1', '2.2', '2.3', '2.4', '2.5', '2.6'] },
            { title: '3. Hardware & Operating System', items: ['3.1', '3.2', '3.3'] },
            { title: '4. Networking & Load Balancing', items: ['4.1', '4.2', '4.3', '4.4', '4.5'] },
            { title: '5. Storage Architecture', items: ['5.1'] },
            { title: '6. Security & Compliance', items: ['6.1', '6.2', '6.3', '6.4', '6.5', '6.6'] },
            { title: '7. Image Management', items: ['7.1', '7.2'] },
            { title: '8. Observability (Monitoring & Logging)', items: ['8.1', '8.2', '8.3'] },
            { title: '9. Platform Operations & Lifecycle', items: ['9.1', '9.2', '9.3', '9.4'] },
            { title: '10. Automation & Integration', items: ['10.1', '10.2', '10.3'] },
            { title: '11. Disaster Recovery', items: ['11.1', '11.2', '11.3'] }
        ];

        const questions = {
            '1.1': 'How many distinct OpenShift clusters are required?',
            '1.2': 'What is the designated purpose for each cluster (e.g., Non-Production, Production, Management, etc.)?',
            '2.1': 'What is the current infrastructure (for example VMware, version, ESXi amount)?',
            '2.2': 'Which installation method will be used: IPI or UPI?',
            '2.3': 'What is the target OCP version? (if it differs between clusters, please specify for each)',
            '2.4': 'What is the mix of node types (VMs, Bare-Metal) and their roles (Master, Worker, Infra)?',
            '2.5': 'What is the planned number of nodes per cluster? Will dedicated infra nodes be used?',
            '2.6': 'Can we confirm high-performance disks (SSDs/NVMe) will be available for etcd on Master nodes?',
            '3.1': 'What are the expectations for future hardware growth?',
            '3.2': 'Are stakeholders familiar with RHCOS as the immutable OS for cluster nodes?',
            '3.3': 'What RHEL version will be used for the bastion server?',
            '4.1': 'Any non-default SDN network needs to avoid overlap? (e.g., default Pods: 10.128.0.0/14, Services: 172.30.0.0/16)',
            '4.2': 'Proposed cluster domain names? DNS server type (Windows/Linux)?',
            '4.3': 'TLS termination is preferred at the OCP route level. Are other methods required (e.g., re-encrypt at the application level)?',
            '4.4': 'What are the Load Balancing options to be considered?',
            '4.5': 'Do applications need to connect to external components (e.g., DB)?',
            '5.1': 'What storage is available (e.g., NetApp)? Will ODF be required? Is S3 compatibility needed?',
            '6.1': 'Which identity provider will be integrated (LDAP (AD) / LDAPS / SSO)?',
            '6.2': 'How will authorization be managed (Local users, AD users/groups, RBAC)?',
            '6.3': 'What is the strategy for implementing Network Policies for traffic segmentation?',
            '6.4': 'Are there specific security benchmarks to follow? If so, is the Compliance Operator needed?',
            '6.5': 'Is there a plan to integrate tools like Red Hat Advanced Cluster Security (ACS)?',
            '6.6': 'Is Service Mesh required for mTLS?',
            '7.1': 'What is the type of installation (disconnected / connected)?',
            '7.2': 'What is the image registry strategy (e.g., local on bastion, external Quay/JFrog/Harbor)?',
            '8.1': 'Discussion of built-in monitoring capabilities. Is user workload monitoring needed? What are the alert destinations (e.g., alert forwarding)?',
            '8.2': 'Discussion of Cluster Logging components (Loki/Vector). Is there a need to forward logs?',
            '8.3': 'Is distributed tracing required (e.g., Tempo, Jaeger)?',
            '9.1': 'Procedures for adding/removing/replacing nodes',
            '9.2': 'What is the strategy for managing cluster upgrades and platform lifecycle?',
            '9.3': 'Can we confirm a reliable internal NTP source is available for all nodes?',
            '9.4': 'What is the strategy for backup and restore (etcd, persistent data)? Which tools?',
            '10.1': 'Which existing CI/CD tools need to be integrated?',
            '10.2': 'Is there an existing GitOps practice in use?',
            '10.3': 'Should a separate management cluster with ACM be considered?',
            '11.1': 'Does DR required?',
            '11.2': 'What method: active-active, active-passive?',
            '11.3': 'Does all cluster needs the DR or only storage?'
        };

        let html = `
            <!DOCTYPE html>
            <html>
            <head>
                <title>OpenShift Discovery Session Checklist</title>
                <style>
                    body { font-family: Arial, sans-serif; margin: 20px; }
                    h1 { color: #1e293b; border-bottom: 2px solid #e2e8f0; padding-bottom: 10px; }
                    h2 { color: #312e81; background-color: #eef2ff; padding: 10px; margin: 20px 0 10px 0; }
                    .question { margin: 15px 0; }
                    .question-text { font-weight: bold; color: #334155; margin-bottom: 5px; }
                    .response { margin: 10px 0; padding: 10px; background-color: #f8fafc; border-left: 4px solid #3b82f6; }
                    .empty { color: #9ca3af; font-style: italic; }
                    @media print {
                        body { margin: 0; }
                        .no-print { display: none; }
                        @page { 
                            margin: 1in;
                            size: A4;
                        }
                        /* Hide browser-added content */
                        * { -webkit-print-color-adjust: exact; }
                        /* Remove any browser headers/footers */
                        @page { 
                            margin: 1in;
                            size: A4;
                        }
                        /* Hide any browser-added elements */
                        body::after, body::before { display: none !important; }
                        html::after, html::before { display: none !important; }
                        /* Specifically target about:blank and other browser-added content */
                        *[href*="about:blank"] { display: none !important; }
                        *[src*="about:blank"] { display: none !important; }
                        /* Remove any automatic page headers/footers */
                        @page { 
                            margin: 1in;
                            size: A4;
                            marks: none;
                        }
                    }
                </style>
            </head>
            <body>
                <h1>OpenShift Discovery Session Checklist</h1>
                <p><strong>Generated on:</strong> ${new Date().toLocaleString()}</p>
        `;

        sections.forEach(section => {
            html += `<h2>${section.title}</h2>`;
            
                            section.items.forEach(item => {
                    const question = questions[item];
                    const response = data.sections[item]?.response || '';
                    
                    html += `
                        <div class="question">
                            <div class="question-text">${item}: ${question}</div>
                            <div class="response">
                                <strong>Response:</strong> 
                                ${response ? response : '<span class="empty">No response provided</span>'}
                            </div>
                        </div>
                    `;
                });
        });

        html += `
                <div class="no-print" style="margin-top: 30px; text-align: center;">
                    <button onclick="window.print()">Print PDF</button>
                </div>
            </body>
            </html>
        `;

        return html;
    }

    clearAll() {
        if (confirm('Are you sure you want to clear all data? This action cannot be undone.')) {
            const textareas = document.querySelectorAll('textarea');
            textareas.forEach(textarea => {
                textarea.value = '';
            });
            localStorage.removeItem('discoverySessionData');
            this.updateProgress();
            this.showToast('All data cleared successfully!', 'success');
        }
    }

    showToast(message, type = 'info') {
        const toast = document.getElementById('toast');
        toast.textContent = message;
        toast.className = `toast ${type}`;
        toast.classList.add('show');

        setTimeout(() => {
            toast.classList.remove('show');
        }, 3000);
    }

    setupCollapsibleSections() {
        const sectionHeaders = document.querySelectorAll('.section-header');
        
        sectionHeaders.forEach(header => {
            header.addEventListener('click', () => {
                const sectionNumber = header.getAttribute('data-section');
                const isCollapsed = header.classList.contains('collapsed');
                
                if (isCollapsed) {
                    // Expand section
                    header.classList.remove('collapsed');
                    this.showSectionContent(sectionNumber);
                } else {
                    // Collapse section
                    header.classList.add('collapsed');
                    this.hideSectionContent(sectionNumber);
                }
            });
        });
    }

    showSectionContent(sectionNumber) {
        const rows = this.getSectionRows(sectionNumber);
        rows.forEach(row => {
            row.style.display = '';
        });
    }

    hideSectionContent(sectionNumber) {
        const rows = this.getSectionRows(sectionNumber);
        rows.forEach(row => {
            row.style.display = 'none';
        });
    }

    getSectionRows(sectionNumber) {
        const header = document.querySelector(`[data-section="${sectionNumber}"]`);
        if (!header) return [];
        
        const rows = [];
        let currentRow = header.nextElementSibling;
        
        // Collect all rows until we hit another section header
        while (currentRow && !currentRow.classList.contains('section-header')) {
            rows.push(currentRow);
            currentRow = currentRow.nextElementSibling;
        }
        
        return rows;
    }

    setupStickyProgress() {
        const stickyProgress = document.getElementById('sticky-progress');
        let lastScrollTop = 0;
        
        window.addEventListener('scroll', () => {
            const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
            
            // Show sticky progress when scrolling down and past the header
            if (scrollTop > 100 && scrollTop > lastScrollTop) {
                stickyProgress.classList.add('show');
            } else if (scrollTop <= 100 || scrollTop < lastScrollTop) {
                stickyProgress.classList.remove('show');
            }
            
            lastScrollTop = scrollTop;
        });
    }
}

// Initialize the tool when the page loads
document.addEventListener('DOMContentLoaded', () => {
    window.discoveryTool = new DiscoverySessionTool();
});

// Global functions for button onclick handlers
function saveData() {
    window.discoveryTool.saveData();
}

function loadData() {
    window.discoveryTool.loadData();
}

function exportToPDF() {
    window.discoveryTool.exportToPDF();
}

function exportToJSON() {
    window.discoveryTool.exportToJSON();
}

function clearAll() {
    window.discoveryTool.clearAll();
} 