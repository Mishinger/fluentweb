//   v1.0
(function () {
  function initTabber(tabber) {
    if (tabber.dataset.tabberInitialized) return;
    tabber.dataset.tabberInitialized = 'true';
    
    const tabs = Array.from(tabber.querySelectorAll('.tab'));
    const tabButtons = document.createElement('div');
    tabButtons.className = 'tab-buttons';
    
    tabs.forEach((tab, index) => {
      const labelNode = Array.from(tab.childNodes).find(
        n => n.nodeType === Node.TEXT_NODE && n.textContent.trim()
      );
      const label = labelNode ? labelNode.textContent.trim() : `Tab ${index + 1}`;
      if (labelNode) tab.removeChild(labelNode);
    
      const content = tab.querySelector('.tab-content');
      const btn = document.createElement('button');
      btn.textContent = label;
      btn.className = 'tab-btn';
      btn.setAttribute('role', 'tab');
      btn.setAttribute('tabindex', index === 0 ? '0' : '-1');
      btn.setAttribute('aria-selected', index === 0 ? 'true' : 'false');
    
      tab.select = () => {
        tabber.querySelectorAll('.tab-btn').forEach(b => {
          b.classList.remove('active');
          b.setAttribute('aria-selected', 'false');
          b.setAttribute('tabindex', '-1');
        });
        tabs.forEach(t => t.querySelector('.tab-content').style.display = 'none');
      
        btn.classList.add('active');
        btn.setAttribute('aria-selected', 'true');
        btn.setAttribute('tabindex', '0');
        content.style.display = 'block';
        btn.focus();
      };
    
      btn.addEventListener('click', () => tab.select());
    
      btn.addEventListener('keydown', e => {
        const buttons = Array.from(tabber.querySelectorAll('.tab-btn'));
        const currentIndex = buttons.indexOf(btn);
        let newIndex = null;
      
        if (e.key === 'ArrowRight') newIndex = (currentIndex + 1) % buttons.length;
        else if (e.key === 'ArrowLeft') newIndex = (currentIndex - 1 + buttons.length) % buttons.length;
        else if (e.key === 'Home') newIndex = 0;
        else if (e.key === 'End') newIndex = buttons.length - 1;
        else if (e.key === 'Enter' || e.key === ' ') tab.select();
      
        if (newIndex !== null) {
          buttons[newIndex].focus();
          e.preventDefault();
        }
      });
    
      tabButtons.appendChild(btn);
      content.style.display = index === 0 ? 'block' : 'none';
      if (index === 0) btn.classList.add('active');
    });
  
    tabber.insertBefore(tabButtons, tabber.firstChild);
  
    tabber.getSelectedTab = () => {
      return tabs.find(tab => {
        const btn = tabButtons.querySelector(`.tab-btn:nth-child(${tabs.indexOf(tab) + 1})`);
        return btn.classList.contains('active');
      });
    };
  }

  function upgradeInputs() {
    const inputs = document.querySelectorAll('input[type="checkbox"], input[type="radio"]');

    inputs.forEach(input => {
      if (input.closest('.checkbox-wrapper, .radio-wrapper')) return;

      const type = input.type;
      const wrapper = document.createElement('label');
      wrapper.className = type === 'checkbox' ? 'checkbox-wrapper' : 'radio-wrapper';

      const custom = document.createElement('span');
      custom.className = type === 'checkbox' ? 'custom-box' : 'custom-circle';

      const labelText = document.createElement('span');
      labelText.className = 'label-text';

      let labelContent = '';
      if (input.nextElementSibling?.tagName === 'LABEL') {
        labelContent = input.nextElementSibling.textContent.trim();
        input.nextElementSibling.remove();
      } else if (input.parentElement?.tagName === 'LABEL') {
        labelContent = input.parentElement.textContent.trim();
        input.parentElement.insertAdjacentElement('beforebegin', wrapper);
        input.parentElement.remove();
      } else {
        labelContent = input.getAttribute('aria-label') || '';
      }

      input.tabindex = 0

      labelText.textContent = labelContent;

      input.parentElement.insertBefore(wrapper, input);
      wrapper.appendChild(input);
      wrapper.appendChild(custom);
      wrapper.appendChild(labelText);
    });
  }

  document.addEventListener('DOMContentLoaded', () => {
    document.querySelectorAll('.tabber').forEach(initTabber);
    upgradeInputs();

    const observer = new MutationObserver(() => {
      document.querySelectorAll('.tabber').forEach(initTabber);
      upgradeInputs();
    });
    observer.observe(document.body, { childList: true, subtree: true });

    const toaster = document.createElement('div');
    toaster.className = 'toaster';
    document.body.appendChild(toaster);

    window.toast = function (message, options = {}) {
      const {
        type = 'info',
        duration = 3000,
        dismissible = true
      } = options;

      const toast = document.createElement('div');
      toast.className = `toast ${type}`;
      toast.innerHTML = `<span class="toast-message">${message}</span>`;

      if (dismissible) {
        const close = document.createElement('button');
        close.className = 'toast-close';
        close.innerHTML = '&times;';
        close.onclick = () => toast.remove();
        toast.appendChild(close);
      }

      toaster.appendChild(toast);

      setTimeout(() => {
        toast.classList.add('hide');
        toast.addEventListener('transitionend', () => toast.remove());
      }, duration);
    };
  });
})();
