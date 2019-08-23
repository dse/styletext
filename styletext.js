var StyleText = {
    init: function () {
        this.initEventHandlers();
        if (this.loadSettingsFromStorage()) {
            this.updateFormFromSettings();
        } else {
            this.updateSettingsFromForm();
        }
        this.applySettingsToTextAreas();
    },
    initEventHandlers: function () {
        document.addEventListener('change', function (event) {
            var control = event.target;
            if (!control.hasAttribute('data-style-text')) {
                return;
            }
            this.updateSettingsFromFormControl(control);
            this.saveSettingsToStorage();
            this.applySettingsToTextAreas();
        }.bind(this));
        document.addEventListener('input', function (event) {
            var control = event.target;
            if (!control.hasAttribute('data-text-area')) {
                return;
            }
            if (!this.settings) {
                this.settings = {};
            }
            this.settings.text = control.value;
            this.saveSettingsToStorage();
        }.bind(this));
        document.addEventListener('click', function (event) {
            var control = event.target;
            if (!control.matches('input[type="reset"]')) {
                return;
            }
            delete this.settings;
            control.form.reset();
            this.saveSettingsToStorage();
            this.updateSettingsFromForm();
            this.applySettingsToTextAreas();
            event.preventDefault();
        }.bind(this));
    },
    updateSettingsFromForm: function () {
        document.querySelectorAll('[data-style-text]').forEach(function (control) {
            this.updateSettingsFromFormControl(control);
        }.bind(this));
    },
    updateSettingsFromFormControl: function (control) {
        var tagName = control.tagName.toLowerCase();
        var name    = control.name;
        var type    = control.type;
        var value;
        if (tagName === 'select') {
            if (control.multiple) {
                return;
            }
            value = control.options[control.selectedIndex].value;
        } else if (tagName === 'input') {
            if (type === 'radio' || type === 'checkbox') {
                return;     // not supported
            }
            value = control.value;
        }
        if (!this.settings) {
            this.settings = {};
        }
        this.settings[name] = value;
    },
    loadSettingsFromStorage: function () {
        var settings = localStorage.getItem('styleText');
        if (settings === undefined || settings === null) {
            delete this.settings;
            return false;
        }
        this.settings = JSON.parse(settings);
        return true;
    },
    saveSettingsToStorage: function () {
        if (this.settings) {
            localStorage.setItem('styleText', JSON.stringify(this.settings));
        } else {
            localStorage.removeItem('styleText');
        }
    },
    applySettingsToTextAreas: function () {
        var textShadow = this.getTextShadowValueFromSettings();
        document.querySelectorAll('[data-text-area]').forEach(function (textarea) {
            this.styleNames.forEach(function (styleName) {
                if (this.settings && this.settings[styleName]) {
                    textarea.style[styleName] = this.settings[styleName];
                } else {
                    textarea.style[styleName] = '';
                }
            }.bind(this));
            if (this.settings && this.settings.text) {
                textarea.value = this.settings.text;
            }
            textarea.style.textShadow = textShadow;
        }.bind(this));
    },
    updateFormFromSettings: function () {
        document.querySelectorAll('[data-style-text]').forEach(function (control) {
            var name    = control.name;
            var tagName = control.tagName.toLowerCase();
            var type    = control.type;
            if (tagName === 'select') {
                if (control.multiple) {
                    return;     // not supported
                }
                for (i = 0; i < control.options.length; i += 1) {
                    if (this.settings && (control.options[i].value === this.settings[name])) {
                        control.selectedIndex = i;
                        break;
                    }
                }
            } else if (tagName === 'input') {
                if (type === 'radio' || type === 'checkbox') {
                    return;     // not supported
                }
                if (this.settings && this.settings[name]) {
                    control.value = this.settings[name];
                }
            }
        }.bind(this));
    },
    styleNames: [
        'fontFamily',
        'fontStyle',
        'fontWeight',
        'fontSize',
        'color',
        'backgroundColor',
        'textAlign',
        'fontStretch',
        'padding'
    ],
    getTextShadowValueFromSettings: function () {
        var dropShadow = Number(this.settings && this.settings.dropShadow);
        var dropShadowColor = this.settings && this.settings.dropShadowColor;
        if (!dropShadow || !dropShadowColor) {
            return '';
        }
        var fontSize = Number(this.settings ? this.settings.fontSize.replace(/px$/, '') : 16);
        var dropShadowSize = Math.round(fontSize * dropShadow);
        var result = [];
        var i;
        for (i = 0.5; i <= dropShadowSize; i += 0.5) {
            result.push("%dpx %dpx %s".replace(/%d/g, i).replace(/%s/g, dropShadowColor));
        }
        if (!result.length) {
            return '';
        }
        result = result.join(', ');
        return result;
    }
};

window.addEventListener('load', function () {
    StyleText.init();
});
