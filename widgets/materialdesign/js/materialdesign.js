/*
    ioBroker.vis vis-materialdesign Widget-Set

    version: "0.2.34"

    Copyright 2019 Scrounger scrounger@gmx.net
*/
"use strict";

if (vis.editMode) {
    let iobSystemDic = systemDictionary;
    $.get("../vis-materialdesign.admin/words.js", function (script) {
        let translation = script.substring(script.indexOf('{'), script.length);
        translation = translation.substring(0, translation.lastIndexOf(';'));
        $.extend(systemDictionary, JSON.parse(translation));
        $.extend(systemDictionary, iobSystemDic);
    });
}

// this code can be placed directly in materialdesign.html
vis.binds.materialdesign = {
    version: "0.2.34",
    showVersion: function () {
        if (vis.binds["materialdesign"].version) {
            console.log('Version vis-materialdesign: ' + vis.binds["materialdesign"].version);
            vis.binds["materialdesign"].version = null;
        }
    },
    // initVuetfiyApp: function () {
    //     $(window).on('load', function () {
    //         let myHelper = vis.binds.materialdesign.helper;
    //         myHelper.waitForElement($("body"), '#vis_container', function () {
    //             if ($("#materialdesign-vuetify-container").length === 0) {
    //                 // intitialize Vuetify v-app application container, if not exist
    //                 $('body').wrapInner('<v-app id="materialdesign-vuetify-container" data-app="true">');
    //                 console.log('initialize vuetify v-app application container');
    //             }
    //         });
    //     });
    // },
    createWidget: function (widgetID, view, data, style) {
        var $div = $('#' + widgetID);
        // if nothing found => wait
        if (!$div.length) {
            return setTimeout(function () {
                vis.binds["materialdesign"].createWidget(widgetID, view, data, style);
            }, 100);
        }

        var text = '';
        text += 'OID: ' + data.oid + '</div><br>';
        text += 'OID value: <span class="myset-value">' + vis.states[data.oid + '.val'] + '</span><br>';
        text += 'Color: <span style="color: ' + data.myColor + '">' + data.myColor + '</span><br>';
        text += 'extraAttr: ' + data.extraAttr + '<br>';
        text += 'Browser instance: ' + vis.instance + '<br>';
        text += 'htmlText: <textarea readonly style="width:100%">' + (data.htmlText || '') + '</textarea><br>';

        $('#' + widgetID).html(text);

        // subscribe on updates of value
        if (data.oid) {
            vis.states.bind(data.oid + '.val', function (e, newVal, oldVal) {
                $div.find('.materialdesign-value').html(newVal);
            });
        }
    },
    addRippleEffect: function (el, data, isIconButton = false) {
        var $this = $(el).parent();
        if (!isIconButton) {
            mdc.ripple.MDCRipple.attachTo($this.context);
            var colorPress = (data.colorPress === undefined || data.colorPress === null || data.colorPress === '') ? '' : data.colorPress;

            if (data.buttonStyle === 'text' || data.buttonStyle === 'outlined') {
                $this.context.style.setProperty("--mdc-theme-primary", colorPress);
            } else {
                $this.context.style.setProperty("--mdc-theme-on-primary", colorPress);
            }
        } else {
            var colorPress = (data.colorPress === undefined || data.colorPress === null || data.colorPress === '') ? '' : data.colorPress;
            $this.context.style.setProperty("--mdc-theme-primary", colorPress);

            const mdcIconButton = new mdc.iconButton.MDCIconButtonToggle($this.context);
        }

        $(el).click(function () {
            vis.binds.materialdesign.helper.vibrate(data.vibrateOnMobilDevices);
        });
    },
    buttonToggle: function (el, data) {
        try {
            var $this = $(el).parent();

            let bgColor = myMdwHelper.getValueFromData(data.colorBgFalse, '');
            let bgColorTrue = myMdwHelper.getValueFromData(data.colorBgTrue, bgColor);

            let labelBgColor = myMdwHelper.getValueFromData(data.labelColorBgFalse, '');
            let labelBgColorTrue = myMdwHelper.getValueFromData(data.labelColorBgTrue, labelBgColor);

            setButtonState();

            if (data.readOnly && !vis.editMode) {
                $this.parent().css('pointer-events', 'none');
            }

            vis.states.bind(data.oid + '.val', function (e, newVal, oldVal) {
                setButtonState();
            });

            if (!vis.editMode) {
                $this.click(function () {
                    if (data.toggleType === 'boolean') {
                        vis.setValue(data.oid, !vis.states.attr(data.oid + '.val'));
                    } else {
                        if ($this.attr('toggled') === true || $this.attr('toggled') === 'true') {
                            vis.setValue(data.oid, data.valueOff);
                        } else {
                            vis.setValue(data.oid, data.valueOn);
                        }
                    }
                });
            }

            function setButtonState() {
                var val = vis.states.attr(data.oid + '.val');

                let buttonState = false;

                if (data.toggleType === 'boolean') {
                    buttonState = val;
                } else {
                    if (val === parseInt(data.valueOn) || val === data.valueOn) {
                        buttonState = true;
                    } else if (val !== parseInt(data.valueOn) && val !== data.valueOn && val !== parseInt(data.valueOff) && val !== data.valueOff && data.stateIfNotTrueValue === 'on') {
                        buttonState = true;
                    }
                }

                if (buttonState) {
                    $this.attr('toggled', true);

                    $this.find('.imgToggleTrue').show();
                    $this.find('.imgToggleFalse').hide();

                    $this.find('.labelToggleTrue').show();
                    $this.find('.labelToggleFalse').hide();

                    $this.parent().css('background', bgColorTrue);
                    $this.find('.labelRowContainer').css('background', labelBgColorTrue);
                } else {
                    $this.attr('toggled', false);

                    $this.find('.imgToggleTrue').hide();
                    $this.find('.imgToggleFalse').show();

                    $this.find('.labelToggleTrue').hide();
                    $this.find('.labelToggleFalse').show();

                    $this.parent().css('background', bgColor);
                    $this.find('.labelRowContainer').css('background', labelBgColor);
                }
            }

        } catch (ex) {
            console.exception(`toggle [${data.wid}]: error:: ${ex.message}, stack: ${ex.stack}`);
        }
    },
    mdcSlider: function (el, data, discrete = false) {
        try {
            let $this = $(el);

            let min = myMdwHelper.getValueFromData(data.min, 0);
            let labelMin = myMdwHelper.getValueFromData(data.valueLabelMin, null);
            let max = myMdwHelper.getValueFromData(data.max, 1);
            let labelMax = myMdwHelper.getValueFromData(data.valueLabelMax, null);
            let unit = myMdwHelper.getValueFromData(data.valueLabelUnit, '');

            let valueLessThan = myMdwHelper.getValueFromData(data.valueLessThan, min);
            let textForValueLessThan = myMdwHelper.getValueFromData(data.textForValueLessThan, null);
            let valueGreaterThan = myMdwHelper.getValueFromData(data.valueGreaterThan, max);
            let textForValueGreaterThan = myMdwHelper.getValueFromData(data.textForValueGreaterThan, null);

            let showMarker = '';
            if (data.showMarkers === 'true' || data.showMarkers === true) {
                showMarker = 'mdc-slider--display-markers';
            }

            setTimeout(function () {
                let valueOnLoading = vis.states.attr(data.oid + '.val');

                // Slider Attributes für Initialisierung ermitteln
                let pctComplete = (valueOnLoading - data.min) / (data.max - data.min);
                let sliderWidth = window.getComputedStyle($this.context, null).width.replace('px', '');

                let labelWitdh = 0;
                if (data.showValueLabel === true || data.showValueLabel === 'true') {
                    labelWitdh = data.valueLabelWidth;
                }

                let translatePx = (sliderWidth - labelWitdh) * pctComplete;

                // Slider Element dynamisch erzeugen
                let sliderConstructor = '';
                if (!discrete) {
                    sliderConstructor =
                        `<span style="color:red"><b>Will be removed in next Version! Please use the new slider!</b></span>
                        <div class="mdc-slider" tabindex="0" role="slider" style="<%= colorSlider %>" aria-valuemin="${data.min}" aria-valuemax="${data.max}" aria-valuenow="${valueOnLoading}" data-step="${data.step}">
                            <div class="mdc-slider__track-container">
                                <div class="mdc-slider__track" style="transform: scaleX(${pctComplete});"></div>
                            </div>
                            <div class="mdc-slider__thumb-container" style="transform: translateX(${translatePx}px) translateX(-50%);">
                                <svg class="mdc-slider__thumb" width="21" height="21">
                                    <circle cx="10.5" cy="10.5" r="7.875"></circle>
                                </svg>
                                <div class="mdc-slider__focus-ring"></div>
                            </div>
                        </div>`;
                } else {
                    sliderConstructor =
                        `<span style="color:red"><b>Will be removed in next Version! Please use the new slider!</b></span>
                        <div class="mdc-slider mdc-slider--discrete ${showMarker}" tabindex="0" role="slider" aria-valuemin="${data.min}" aria-valuemax="${data.max}" aria-valuenow="${valueOnLoading}" data-step="${data.step}">
                        <div class="mdc-slider__track-container">
                            <div class="mdc-slider__track" style="transform: scaleX(${pctComplete});"></div>
                            <div class="mdc-slider__track-marker-container"></div>
                        </div>
                        <div class="mdc-slider__thumb-container" style="transform: translateX(${translatePx}px) translateX(-50%);">
                            <div class="mdc-slider__pin">
                                <span class="mdc-slider__pin-value-marker"></span>
                            </div>
                            <svg class="mdc-slider__thumb" width="21" height="21">
                                <circle cx="10.5" cy="10.5" r="7.875"></circle>
                            </svg>
                            <div class="mdc-slider__focus-ring"></div>
                        </div>
                    </div>`;
                }

                if (labelWitdh > 0) {
                    sliderConstructor = sliderConstructor +
                        `<span class="labelValue" style="width: ${labelWitdh}px; text-align: right;">${valueOnLoading} ${unit}</span>`;
                }

                // Slider hinzufügen
                $this.html(`<div class="materialdesign vis-widget-body" style="display: flex; justify-content: center; align-items: center;">
                                ${sliderConstructor}
                            </div>`);

                // Slider Control
                let sliderElement = $this.find('.mdc-slider').get(0);

                // Colors
                sliderElement.style.setProperty("--materialdesign-color-slider-before-thumb", myMdwHelper.getValueFromData(data.colorBeforeThumb, ''));
                sliderElement.style.setProperty("--materialdesign-color-slider-thumb", myMdwHelper.getValueFromData(data.colorThumb, ''));
                sliderElement.style.setProperty("--materialdesign-color-slider-after-thumb", myMdwHelper.getValueFromData(data.colorAfterThumb, ''));
                sliderElement.style.setProperty("--materialdesign-color-slider-track-marker", myMdwHelper.getValueFromData(data.colorTrackMarker, ''));

                if (data.knobSize === 'knobMedium') {
                    $this.find('.mdc-slider__thumb').attr('width', '31').attr('height', '31').css('margin-left', '-5px').css('margin-top', '-5px');
                    $this.find('.mdc-slider__pin').css('margin-top', '-5px');
                    $this.find('circle').attr('cx', '15.5').attr('cy', '15.5').attr('r', '11.8125');
                } else if (data.knobSize === 'knobBig') {
                    $this.find('.mdc-slider__thumb').attr('width', '42').attr('height', '42').css('margin-left', '-10px').css('margin-top', '-10px');
                    $this.find('.mdc-slider__pin').css('margin-top', '-7px');
                    $this.find('circle').attr('cx', '21').attr('cy', '21').attr('r', '15.75');
                }

                if (!vis.editMode) {
                    const mdcSlider = new mdc.slider.MDCSlider(sliderElement);

                    // Slider Initialiserung setzen
                    setSliderState();

                    // Slider user input -> Wert übergeben
                    mdcSlider.listen('MDCSlider:change', function () {
                        vis.setValue(data.oid, mdcSlider.value);
                    });

                    mdcSlider.listen('MDCSlider:input', function () {
                        setSliderState(false, mdcSlider.value);
                    });

                    $this.find('.mdc-slider').on('touchstart mousedown', function (e) {
                        e.preventDefault();
                        vis.binds.materialdesign.helper.vibrate(data.vibrateOnMobilDevices);
                    });

                    vis.states.bind(data.oid + '.val', function (e, newVal, oldVal) {
                        setSliderState();
                    });

                    vis.states.bind(data.wid + '.val', function (e, newVal, oldVal) {
                        if (!newVal) {
                            setSliderState();
                        }
                    });




                    function setSliderState(setVisValue = true, val = 0) {
                        if (!vis.states.attr(data.wid + '.val')) {
                            if (setVisValue) {
                                val = vis.states.attr(data.oid + '.val');
                                mdcSlider.value = val;
                            }

                            if (val <= min && labelMin != null) {
                                $this.find('.labelValue').html(labelMin);
                            } else if (val > min && val <= valueLessThan && textForValueLessThan != null) {
                                $this.find('.labelValue').html(textForValueLessThan);
                            } else if (val >= valueGreaterThan && val < max && textForValueGreaterThan != null) {
                                $this.find('.labelValue').html(textForValueGreaterThan);
                            } else if (val >= max && labelMax != null) {
                                $this.find('.labelValue').html(labelMax);
                            } else {
                                $this.find('.labelValue').html(`${val} ${unit}`);
                            }
                        }
                    }
                }
            }, data.initDelay);
        } catch (ex) {
            console.exception(`mdcSlider [${data.wid}]: error:: ${ex.message}, stack: ${ex.stack}`);
        }
    },
    mdcProgress: function (el, data) {
        try {
            let $this = $(el);
            let progressElement = $this.context;
            var oid = $this.attr('data-oid');

            const mdcProgress = new mdc.linearProgress.MDCLinearProgress(progressElement);

            setTimeout(function () {

                // since mdc 4.0.0, current progress is styled over border-top property
                // let widgetHeight = window.getComputedStyle($this.context, null).height;
                // let currentProgressEl = $this.find('.mdc-linear-progress__bar-inner');
                // $this.find('.mdc-linear-progress__bar-inner').css('border-top', `${widgetHeight} solid`).css('-webkit-border-top', `${widgetHeight} solid`);

                var min = myMdwHelper.getValueFromData(data.min, 0);
                var max = myMdwHelper.getValueFromData(data.max, 1);
                var unit = myMdwHelper.getValueFromData(data.valueLabelUnit, '');
                var decimals = myMdwHelper.getValueFromData(data.valueMaxDecimals, 0);

                mdcProgress.reverse = data.reverse;

                var color = myMdwHelper.getValueFromData(data.colorProgress, '');
                var colorOneCondition = myMdwHelper.getValueFromData(data.colorOneCondition, 0);
                var colorOne = myMdwHelper.getValueFromData(data.colorOne, '');
                var colorTwoCondition = myMdwHelper.getValueFromData(data.colorTwoCondition, 0);
                var colorTwo = myMdwHelper.getValueFromData(data.colorTwo, '');


                if (colorOne === '') colorOne = color;
                if (colorTwo === '') colorTwo = color;

                setProgressState();

                vis.states.bind(oid + '.val', function (e, newVal, oldVal) {
                    setProgressState();
                });

                function setProgressState() {
                    var val = vis.states.attr(oid + '.val');

                    // Falls quellen boolean ist
                    if (val === true || val === 'true') val = max;
                    if (val === false || val === 'false') val = min;

                    val = parseFloat(val);

                    if (isNaN(val)) val = min;
                    if (val < min) val = min;
                    if (val > max) val = max;

                    let simRange = 100;
                    let range = max - min;
                    let factor = simRange / range;
                    val = Math.floor((val - min) * factor);

                    mdcProgress.progress = val / 100;

                    let valueLabel = Math.round(vis.states.attr(oid + '.val') * Math.pow(10, decimals)) / Math.pow(10, decimals)
                    $this.parents('.materialdesign.vis-widget-body').find('.labelValue').html('&nbsp;' + valueLabel + unit + '&nbsp;');

                    if (valueLabel > colorOneCondition && valueLabel <= colorTwoCondition) {
                        $this.find('.mdc-linear-progress__bar-inner').css('border-top-color', colorOne)
                    } else if (valueLabel > colorTwoCondition) {
                        $this.find('.mdc-linear-progress__bar-inner').css('border-top-color', colorTwo)
                    } else {
                        $this.find('.mdc-linear-progress__bar-inner').css('border-top-color', color)
                    }
                }
            }, 1);
        } catch (ex) {
            console.exception(`mdcProgress [${data.wid}]: error:: ${ex.message}, stack: ${ex.stack}`);
        }
    },
    mdcIconButtonToggle: function (el, data) {
        try {
            let $this = $(el);

            var colorBgFalse = (data.colorBgFalse === undefined || data.colorBgFalse === null || data.colorBgFalse === '') ? '' : data.colorBgFalse;
            var colorBgTrue = (data.colorBgTrue === undefined || data.colorBgTrue === null || data.colorBgTrue === '') ? '' : data.colorBgTrue;

            var colorPress = (data.colorPress === undefined || data.colorPress === null || data.colorPress === '') ? '' : data.colorPress;
            $this.context.style.setProperty("--mdc-theme-primary", colorPress);

            const mdcIconButton = new mdc.iconButton.MDCIconButtonToggle($this.context);

            if (data.readOnly && !vis.editMode) {
                $this.css('pointer-events', 'none');
            }

            setIconButtonState();

            if (!vis.editMode) {
                mdcIconButton.listen('MDCIconButtonToggle:change', function () {
                    vis.binds.materialdesign.helper.vibrate(data.vibrateOnMobilDevices);

                    if (data.toggleType === 'boolean') {
                        vis.setValue(data.oid, mdcIconButton.on);
                    } else {
                        if (!mdcIconButton.on) {
                            vis.setValue(data.oid, data.valueOff);
                        } else {
                            vis.setValue(data.oid, data.valueOn);
                        }
                    }

                    setIconButtonState();
                });
            }

            vis.states.bind(data.oid + '.val', function (e, newVal, oldVal) {
                setIconButtonState();
            });

            function setIconButtonState() {
                var val = vis.states.attr(data.oid + '.val');
                let buttonState = false;

                if (data.toggleType === 'boolean') {
                    buttonState = val;
                } else {
                    if (val === parseInt(data.valueOn) || val === data.valueOn) {
                        buttonState = true;
                    } else if (val !== parseInt(data.valueOn) && val !== data.valueOn && val !== parseInt(data.valueOff) && val !== data.valueOff && data.stateIfNotTrueValue === 'on') {
                        buttonState = true;
                    }
                }

                if (buttonState) {
                    mdcIconButton.on = true;

                    $this.find('.imgToggleFalse').hide();
                    $this.find('.imgToggleTrue').show();
                    $this.css('background', colorBgTrue);
                } else {
                    mdcIconButton.on = false;

                    $this.find('.imgToggleFalse').show();
                    $this.find('.imgToggleTrue').hide();
                    $this.css('background', colorBgFalse);
                }
            };
        } catch (ex) {
            console.exception(`mdcIconButton [${data.wid}]: error:: ${ex.message}, stack: ${ex.stack}`);
        }
    },
    editorManualLink: function (widAttr, data) {
        let url = 'https://github.com/Scrounger/ioBroker.vis-materialdesign#iobrokervis-materialdesign';

        if (data) {

            if (data[1] === 'card') {
                url = 'https://github.com/Scrounger/ioBroker.vis-materialdesign#card'
            }

            if (data[1] === 'drawer') {
                url = 'https://github.com/Scrounger/ioBroker.vis-materialdesign#top-app-bar-with-navigation-drawer'
            }

            if (data[1] === 'drawerSubMenuViews') {
                url = 'https://github.com/Scrounger/ioBroker.vis-materialdesign#submenu'
            }

            if (data[1] === 'lineHistoryChart') {
                url = 'https://github.com/Scrounger/ioBroker.vis-materialdesign#line-history-chart'
            }

            if (data[1] === 'list') {
                url = 'https://github.com/Scrounger/ioBroker.vis-materialdesign#list'
            }

            if (data[1] === 'progress') {
                url = 'https://github.com/Scrounger/ioBroker.vis-materialdesign#progress'
            }

            if (data[1] === 'slider') {
                url = 'https://github.com/Scrounger/ioBroker.vis-materialdesign#slider'
            }

            if (data[1] === 'switch') {
                url = 'https://github.com/Scrounger/ioBroker.vis-materialdesign#switch'
            }

            if (data[1] === 'table') {
                url = 'https://github.com/Scrounger/ioBroker.vis-materialdesign#table'
            }

            if (data[1] === 'columnViews') {
                url = 'https://github.com/Scrounger/ioBroker.vis-materialdesign#column-views'
            }
        }

        return { input: `<a target="_blank" href="${url}">${_('readme')}</a>` }
    },
    editorBmc: function (widAttr) {
        return { input: `<a target="_blank" href="https://www.paypal.com/cgi-bin/webscr?cmd=_s-xclick&hosted_button_id=VWAXSTS634G88&source=url">${_('buymeacoffee')}</a>` }
    },
    editorOnlineExample: function (widAttr) {
        return { input: `<a target="_blank" href="https://github.com/Scrounger/ioBroker.vis-materialdesign#online-example-project">${_('linkOnlineExampleProject')}</a>` }
    }
};

vis.binds["materialdesign"].showVersion();
// vis.binds["materialdesign"].initVuetfiyApp();