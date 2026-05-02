(function() {
    // Prevent multiple loads
    if (window.FitoAgentsLoaded) return;
    window.FitoAgentsLoaded = true;

    // Find the script tag and extract config
    const script = document.currentScript || (function() {
        const scripts = document.getElementsByTagName('script');
        return scripts[scripts.length - 1];
    })();

    const agentId = script.getAttribute('data-agent-id');
    const position = script.getAttribute('data-position') || 'bottom-right';
    const primaryColor = script.getAttribute('data-primary-color');
    const theme = script.getAttribute('data-theme') || 'dark';

    if (!agentId) {
        console.error('Fito Agents: Missing data-agent-id attribute on script tag.');
        return;
    }

    // Create Widget Container (Iframe)
    const iframe = document.createElement('iframe');
    const baseUrl = script.src.split('/embed.js')[0];
    
    // Build Widget URL
    const widgetUrl = new URL(`${baseUrl}/widget/${agentId}`);
    if (position) widgetUrl.searchParams.set('position', position);
    if (primaryColor) widgetUrl.searchParams.set('primary-color', primaryColor);
    if (theme) widgetUrl.searchParams.set('theme', theme);

    // Initial Styles - Small for the button
    Object.assign(iframe.style, {
        position: 'fixed',
        bottom: '20px',
        right: position === 'bottom-left' ? 'auto' : '20px',
        left: position === 'bottom-left' ? '20px' : 'auto',
        width: '80px',
        height: '80px',
        border: 'none',
        zIndex: '999999',
        colorScheme: 'light',
        background: 'transparent',
        transition: 'width 0.3s cubic-bezier(0.4, 0, 0.2, 1), height 0.3s cubic-bezier(0.4, 0, 0.2, 1), bottom 0.3s, right 0.3s, left 0.3s',
        overflow: 'hidden'
    });

    iframe.src = widgetUrl.toString();
    iframe.id = 'fito-agents-widget';
    iframe.setAttribute('allow', 'clipboard-write');

    // Handle Resize from Iframe
    window.addEventListener('message', (event) => {
        if (event.origin !== baseUrl) return;
        
        if (event.data.type === 'fito-resize') {
            if (event.data.state === 'open') {
                if (window.innerWidth < 640) {
                    iframe.style.width = '100%';
                    iframe.style.height = '100%';
                    iframe.style.bottom = '0';
                    iframe.style.right = '0';
                    iframe.style.left = '0';
                } else {
                    iframe.style.width = '420px';
                    iframe.style.height = '700px';
                    iframe.style.bottom = '20px';
                    iframe.style.right = position === 'bottom-left' ? 'auto' : '20px';
                    iframe.style.left = position === 'bottom-left' ? '20px' : 'auto';
                }
            } else {
                iframe.style.width = '80px';
                iframe.style.height = '80px';
                iframe.style.bottom = '20px';
                iframe.style.right = position === 'bottom-left' ? 'auto' : '20px';
                iframe.style.left = position === 'bottom-left' ? '20px' : 'auto';
            }
        }
    });

    document.body.appendChild(iframe);
})();
