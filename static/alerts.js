document.addEventListener('DOMContentLoaded', () => {
    // Check if container exists, if not, create it
    let container = document.getElementById('global-alerts-container');
    if (!container) {
        container = document.createElement('div');
        container.id = 'global-alerts-container';
        document.body.appendChild(container);
    }

    const icons = {
        success: `<svg fill="none" class="m-0" stroke="currentColor" viewBox="0 0 24 24" style="width:24px;height:24px;"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>`,
        error: `<svg fill="none" class="m-0" stroke="currentColor" viewBox="0 0 24 24" style="width:24px;height:24px;"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>`,
        warning: `<svg fill="none" class="m-0" stroke="currentColor" viewBox="0 0 24 24" style="width:24px;height:24px;"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"></path></svg>`,
        info: `<svg fill="none" class="m-0" stroke="currentColor" viewBox="0 0 24 24" style="width:24px;height:24px;"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>`,
        close: `<svg fill="none" class="m-0" stroke="currentColor" viewBox="0 0 24 24" style="width:16px;height:16px;"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path></svg>`
    };

    window.showPopupAlert = function(message, category = 'info', duration = 4000) {
        // Map common flask categories
        if (category === 'danger') category = 'error';
        if (category === 'message') category = 'info';
        
        const popup = document.createElement('div');
        popup.className = `popup-alert ${category}`;
        
        let iconHtml = icons[category] || icons['info'];

        popup.innerHTML = `
            <div class="popup-icon">${iconHtml}</div>
            <div class="popup-content">
                <div class="popup-title">${category}</div>
                <div class="popup-desc">${message}</div>
            </div>
            <button class="popup-close" aria-label="Close">${icons.close}</button>
            <div class="popup-progress"><div class="popup-progress-bar"></div></div>
        `;

        container.appendChild(popup);
        
        // Trigger animation
        requestAnimationFrame(() => {
            popup.classList.add('show');
            const progressBar = popup.querySelector('.popup-progress-bar');
            progressBar.style.transition = `transform ${duration}ms linear`;
            progressBar.style.transform = 'scaleX(0)';
        });

        // Close logic
        const closeBtn = popup.querySelector('.popup-close');
        let closeTimeout;

        const closePopup = () => {
            popup.classList.remove('show');
            setTimeout(() => {
                popup.remove();
            }, 400); // Wait for CSS transition
        };

        closeBtn.addEventListener('click', () => {
            clearTimeout(closeTimeout);
            closePopup();
        });

        closeTimeout = setTimeout(() => {
            closePopup();
        }, duration);
    };

    // Auto-detect existing flask flash messages in the DOM (but hidden by CSS)
    const existingAlerts = document.querySelectorAll('.flash-container div');
    let delay = 0;
    existingAlerts.forEach((flash) => {
        const message = flash.textContent.trim();
        if(!message) return;
        
        let category = 'info';
        if (flash.className.includes('success')) category = 'success';
        if (flash.className.includes('error') || flash.className.includes('danger')) category = 'error';
        if (flash.className.includes('warning')) category = 'warning';
        
        // Hide original natively (if our CSS override fails somehow)
        flash.style.display = 'none';
        if (flash.parentElement && (flash.parentElement.classList.contains('flash-messages') || flash.parentElement.classList.contains('flash-container'))) {
            flash.parentElement.style.display = 'none';
        }
        
        // Slight delay for staggered popping
        setTimeout(() => {
            showPopupAlert(message, category);
        }, delay);
        delay += 300;
    });
});
