import {EventController} from '../lib/event-controller.js';

export class TabLayout {

    /**
     * @param config Generic config for all views
     * @param {('top'|'bottom')} config.position Position of tabs
     * @param {boolean} config.overflow Display button for overflow dropdown menu
     * @param {string} config.group Provide a name where multiple tab layouts share focus
     * @param {string} config.uid unique id for items in the app
     * @param {object} config.parentInfo parent view
     */
    constructor(config = {}) {
        this.config = config;
        this.type = "TabPanel";
        this.children = {};
        this.tabNameInFocus = '';
        this.uid = config.uid;
        this.parentInfo = config.parentInfo;
    }

    //=========================================================================
    // MOUNT AND RENDER PARENT STRUCTURE OF TAB LAYOUT
    //=========================================================================
    mount(el) {
        this.parentEl = el;
        (this.config.position === 'bottom') ? this.renderTabsBottom() : this.renderTabsTop();
        this.el = this.parentEl.firstElementChild;
        this.el.id = this.uid;
        this.tabsEl = el.querySelector('.tab-layout--tabs');
        this.bodyEl = el.querySelector('.tab-layout--body');
        this.registerEvents();
    }

    renderTabsTop() {
        this.parentEl.innerHTML = `<div class="tab-layout ">
            <div class="tab-layout--tabs"></div>
            ${(this.config.overflow) ? `
            <div class="tab-layout--overflow-button">
                <button class="flex-right menu-top-button rel" id="file-menu">
                    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="feather feather-chevron-down"><polyline points="6 9 12 15 18 9"></polyline></svg>
                    <div class="tab-layout--overflow-menu sub-menu menu-below-right">
                    </div>
                </button>
            </div>` : ''}
            <div class="tab-layout--body"></div>
        </div>`;
        this.overFlowMenuEl=this.parentEl.querySelector('.sub-menu');
    }

    renderTabsBottom() {
        this.parentEl.innerHTML = `<div class="tab-panel">
            <div class="tab-layout--body"></div>
            <div class="tab-layout--tabs"></div>            
        </div>`;
    }

    registerEvents() {
        this.tabsEl.addEventListener('click', (ev) => this.onTabItemClick(ev));
        this.el.addEventListener('click', (ev) => EventController.publishEvent("TabLayoutGotFocus", this, false, false));
    }

    //=========================================================================
    // TAB ITEM CLICK
    //=========================================================================
    onTabItemClick(ev) {
        let tabName = this.getTabNameFromChildEl(ev.target);
        if (tabName === '') return;
        EventController.publishEvent('SetTabItemInFocusByName',{"tabName":tabName,"tabLayoutUid":this.uid}, false ,false)
        this.setTabItemInFocusByName(tabName);
        if (ev.target.parentElement.classList.contains('sub-menu')) {
            let action = ev.target.innerText;
            EventController.publishEvent("Actions.EditorTabContextMenu",{'action':action,'name':tabName},false,false);
        }
        if (ev.target.nodeName !== 'BUTTON' && ev.target.parentElement.nodeName !== 'BUTTON' && ev.target.parentElement.parentElement.nodeName !== 'BUTTON') {
            let editor = this.getTabItemInFocus().editor;
            if (editor) editor.focus();
        }
    }

    getTabNameFromChildEl(el) {
        let tab = el.closest('[data-name]');
        if (tab === null) return ''; //TODO: if you have to do this, then the design is wrong, review and refactor
        return tab.dataset.name || '';
    }

    //=========================================================================
    // ADD NEW TAB TO LAYOUT
    //=========================================================================
    addNewTabToLayout(tabName,tabBodyView,tabContextMenuFragment) {
        this.addTabHeader(tabName,tabContextMenuFragment)
        this.addTabBody(tabName,tabBodyView)
        this.addOverflowItem(tabName)
    }

    addTabBody(tabName,tabBodyView) {
        this.children[tabName] = tabBodyView;
        tabBodyView.mount(this.bodyEl);
        tabBodyView.show();
        this.setTabItemInFocusByName(tabName);
    }

    addTabHeader(tabName,tabContextMenuFragment) {
        this.tabsEl.insertAdjacentHTML('afterbegin',
            `<div class="tab-layout--tab" data-name="${tabName}">
                    <div class="flex-row flex-center-items">
                        <div class="flex-1">${tabName}</div>
                        <button class="rel menu-tab-button">
                            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="feather feather-chevron-down"><polyline points="6 9 12 15 18 9"></polyline></svg>
                            <div class="sub-menu menu-below">${this.getTabCommonMenuFragmentForTab()}${tabContextMenuFragment}</div>
                        </button>
                    </div>
                  </div>`
        )
    }

    addOverflowItem(name) {
        this.overFlowMenuEl.insertAdjacentHTML('afterbegin',`<div onclick="DevBoxEventController.publishEvent('OverflowItemSelected',this,false,true)"  data-name="${name}">${name}</div>`);
    }

    getTabCommonMenuFragmentForTab() {
        return `<div>Close</div>
            <div class="disabled">Close Others</div>
            <div class="disabled">Close Others Right</div>
            <div class="disabled">Close Others Left</div>
            <div class="menu-divide"></div>
            <div>Move Right</div>
            <div class="disabled">Move Left</div>`
    }

    moveTabToStart(name) {
        let el = this.tabsEl.querySelector(`[data-name="${name}"]`);
        this.tabsEl.prepend(el);
    }

    //=========================================================================
    // REMOVE TAB FROM TAB PARENT LAYOUT
    //=========================================================================
    remove(name) {
        delete this.children[name];
        this.tabsEl.querySelector(`[data-name="${name}"]`).remove();
        this.overFlowMenuEl.querySelector(`[data-name="${name}"]`).remove();
        if (this.tabNameInFocus === name) {
            let first = this.tabsEl.firstElementChild;
            if (first) this.setTabItemInFocusByName(first.dataset.name);
        }
        //TODO: if last item in tab layout and more than one layout, then remove layout as well
    }

    deleteTab(name) {
        this.children[name].el.remove();
        this.remove(name);
    }

    isEmpty() {
        let empty = true;
        for (const p in this.children) {
            empty = false;
        }
        return empty;
    }

    //=========================================================================
    // SET / GET TAB IN FOCUS
    //=========================================================================
    setTabItemInFocusByName(name) {
        //un-focus and hide other tabs
        let focused = this.tabsEl.querySelector('.tab-layout--tab-focused')
        if (focused) focused.classList.remove('tab-layout--tab-focused')
        for (let child in this.children) {
            this.children[child].hide();
        }
        //focus and show this tab
        this.tabsEl.querySelector(`[data-name="${name}"]`).classList.add('tab-layout--tab-focused');
        this.children[name].show();
        this.tabNameInFocus = name;
        //this.getTabItemInFocus().editor.focus();
    }

    getTabItemInFocus() {
        return this.children[this.tabNameInFocus];
    }

}