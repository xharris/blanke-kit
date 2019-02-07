// requires jQuery Color Picker (http://www.laktek.com/2008/10/27/really-simple-color-picker-in-jquery/)

function ifndef(val, def) {
    if (val == undefined) return def;
    return val
}

function ifndef_obj(obj, defaults) {
    if (!obj) obj = {};
    for (let d in defaults) {
        if (obj[d] === undefined) obj[d] = defaults[d];
    }
}

function guid() {
  function s4() {
    return Math.floor((1 + Math.random()) * 0x10000)
    .toString(16)
    .substring(1);
}
return s4() + s4();
}

function htmlEncode(s) {
    var el = document.createElement("div");
    el.innerText = el.textContent = s;
    s = el.innerHTML;
    return s;
}

// Extend the string type to allow converting to hex for quick access.
String.prototype.toHex = function() {
    function intToARGB(i) {
        var hex = ((i>>24)&0xFF).toString(16) +
                ((i>>16)&0xFF).toString(16) +
                ((i>>8)&0xFF).toString(16) +
                (i&0xFF).toString(16);
        // Sometimes the string returned will be too short so we 
        // add zeros to pad it out, which later get removed if
        // the length is greater than six.
        hex += '000000';
        return hex.substring(0, 6);
    }

    function hashCode(str) {
        var hash = 0;
        for (var i = 0; i < str.length; i++) {
            hash = str.charCodeAt(i) + ((hash << 5) - hash);
        }
        return hash;
    }
    return intToARGB(hashCode(this));
}

String.prototype.toRgb = function() {
    let hex = this;

    // Expand shorthand form (e.g. "03F") to full form (e.g. "0033FF")
    var shorthandRegex = /^#?([a-f\d])([a-f\d])([a-f\d])$/i;
    hex = hex.replace(shorthandRegex, function(m, r, g, b) {
        return r + r + g + g + b + b;
    });

    var result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    return result ? {
        r: parseInt(result[1], 16),
        g: parseInt(result[2], 16),
        b: parseInt(result[3], 16)
    } : null;
}

String.prototype.replaceAll = function(find, replace) {
    return this.replace(new RegExp(find, 'g'), replace);
};

String.prototype.escapeSlashes = function() {
    return this.replace(/[\-\[\]\/\{\}\(\)\*\+\?\.\\\^\$\|\"\']/g, "\\$&");
}

String.prototype.hashCode = function(){
	var hash = 0;
	if (this.length == 0) return hash;
	for (i = 0; i < this.length; i++) {
		char = this.charCodeAt(i);
		hash = ((hash<<5)-hash)+char;
		hash = hash & hash; // Convert to 32bit integer
	}
	return Math.abs(hash).toString();
}

String.prototype.addSlashes = function() 
{ 
   //no need to do (str+'') anymore because 'this' can only be a string
   return this.replace(/[\\"']/g, '\\$&').replace(/\u0000/g, '\\0');
} 

function dispatchEvent(ev_name, ev_properties) {
    var new_event = new CustomEvent(ev_name, {'detail': ev_properties});
    document.dispatchEvent(new_event);
}

class BlankeListView {
    constructor (options) {
        var this_ref = this;

        this.options = options;
        this.options.new_item = this.options.new_item || "item";
        this.options.buttons = this.options.buttons || ['add','move-up','move-down'];
        this.selected_text = '';

        this.container = blanke.createElement("div","list-view-container");

        // add title
        if (options.title) {
            let el_title = blanke.createElement("p","list-title");
            el_title.innerHTML = options.title;
            this.container.appendChild(el_title);
        }

        // add item container
        this.el_items_container = blanke.createElement("div","items-container");

        // add list action buttons
        let buttons = {
            "add":[
                "plus", "add a"+('aeiouy'.includes(this.options.new_item.charAt(0)) ? 'n' : '')+" "+this.options.new_item,
                function(e){
                    let count = this_ref.el_items_container.children.length;

                    let text = this_ref.options.new_item+(count)
                    let ret_text = this_ref.onItemAdd(text);
                    this_ref.addItem(ret_text || text);
            }],
            "move-up":[
                "chevron-up","",
                function(e){
                    console.log('move up')
            }],
            "move-down":[
                "chevron-down","",
                function(e){
                    console.log('move down')
            }]
        };
        let el_actions_container = blanke.createElement("div","actions-container");
        for (let btn of this.options.buttons) {
            let el_action = blanke.createElement("button",["ui-button-sphere",btn]);
            let el_icon = blanke.createElement("i",["mdi","mdi-"+buttons[btn][0]]);

            el_action.appendChild(el_icon);
            el_action.title = buttons[btn][1];
            el_action.addEventListener('click', buttons[btn][2]);

            el_actions_container.appendChild(el_action);
        }

        this.container.appendChild(el_actions_container);
        this.container.appendChild(this.el_items_container);
    }

    setItems (list) {
        this.clearItems();
        for (let item of list) {
            this.addItem(item);
        }
    }

    clearItems () {
        blanke.clearElement(this.el_items_container);
    }

    addItem (text) {
        let this_ref = this;

        let el_item_container = blanke.createElement("div","item");
        let el_item_text = blanke.createElement("span","item-text");
        let el_item_actions = blanke.createElement("div","item-actions");

        el_item_text.innerHTML = text;
        el_item_text.style.pointerEvents = "none";

        // add item actions
        if (this.options.actions) {
            for (let opt in this.options.actions) {
                let el_action = blanke.createElement("button","ui-button-sphere");
                let el_icon = blanke.createElement("i",["mdi","mdi-"+opt]);

                el_action.title = this.options.actions[opt];
                el_action.addEventListener('click', function(e){
                    e.stopPropagation();
                    this_ref.onItemAction(opt, text);
                });

                el_action.appendChild(el_icon);
                el_item_actions.appendChild(el_action);
            }
        }

        // add item click event
        el_item_container.el_text = el_item_text;
        el_item_container.addEventListener('click', function(){
            this_ref.selectItem(this.el_text.innerHTML);
            this_ref.onItemSelect(this.el_text.innerHTML);
        });

        el_item_container.appendChild(el_item_text);
        el_item_container.appendChild(el_item_actions);

        this.el_items_container.appendChild(el_item_container);

        // was the list cleared and it was already a selection?
        if (this.selected_text == text)
            this.selectItem(text);
    }

    // highlight it, but dont trigger the event
    selectItem (text) {
        // clear element selection class
        let el_selected;
        let children = this.el_items_container.children;
        for (let c = 0; c < children.length; c++) {
            children[c].classList.remove('selected');

            if (children[c].el_text.innerHTML == text)
                el_selected = children[c];
        }

        if (el_selected) {
            el_selected.classList.add('selected');
            this.selected_text = el_selected.innerHTML;
        }
    }

    removeItem (text) {
        let children = this.el_items_container.children;
        for (let c = 0; c < children.length; c++) {
            if (children[c].el_text.innerHTML == text)
                blanke.destroyElement(children[c]);
        }
    }

    renameItem (text, new_text) {
        let children = this.el_items_container.children;
        for (let c = 0; c < children.length; c++) {
            if (children[c].el_text.innerHTML == text)
                children[c].el_text.innerHTML = new_text;
        }
    }

    getItems () {
        let ret_list = [];
        let children = this.el_items_container.children;
        for (let c = 0; c < children.length; c++) {
            ret_list.append(children[c].el_text.innerHTML)
        }
        return ret_list;
    }

    onItemAdd (text) { }

    onItemAction (item_icon, item_text) { }

    onItemSelect (item_text) { }
}

class BlankeForm {
    /*  inputs = [ [input_name, input_type, {other_args}] ]
        
        input types (input_type {extra_args})
            - text {
                inputs = 1, number of input boxes
                separator = '', separator between multiple input boxes
                default = null
            }
            - number {
                same as text
            }
    */
    constructor (inputs) {
        this.container = blanke.createElement("div", "form-container");
        this.arg_inputs = inputs;
        this.input_ref = {};
        this.input_values = {};
        this.input_types = {};

        for (var input of inputs) {
            this.addInput(input);
        }
    }

    addInput (input) {

        let input_name = input[0];
        let input_type = input[1];
        let extra_args = input[2] || {};
        this.input_ref[input_name] = [];
        this.input_values[input_name] = [];
        this.input_types[input_name] = input_type;

        let container_type = "div";
        if (input_type == "checkbox")
            container_type = "label";

        let el_container    = blanke.createElement(container_type, "form-group");
        let el_label        = blanke.createElement("p", "form-label");
        let el_inputs_container=blanke.createElement("div","form-inputs");

        let prepend_inputs = false;
        // input label
        let show_label = extra_args.label;

        if (show_label === false || input_type == "button")
            show_label = false;

        el_container.setAttribute("data-type", input_type);
        el_label.innerHTML = (show_label || input_name);
        if (show_label !== false) 
            el_container.appendChild(el_label);

        if (input_type == "button") {
            let el_button = blanke.createElement("button","form-button");
            el_button.innerHTML = ifndef(extra_args.label, input_name);
            this.prepareInput(el_button, input_name);
            el_inputs_container.appendChild(el_button);
        }
        
        if (input_type == "text" || input_type == "number") {
            let input_count = 1;
            if (extra_args.inputs) input_count = extra_args.inputs;
            el_container.setAttribute("data-size", input_count);

            // add inputs
            for (var i = 0; i < input_count; i++) {
                let el_text = blanke.createElement("input","form-text");
                // set starting val
                el_text.value = 0;
                if (input_type == "text")
                    el_text.value = ifndef(extra_args.default, "");
                // set input type
                el_text.type = input_type;
                // number: step
                if (input_type == "number" && extra_args.step != undefined)
                    el_text.step = extra_args.step;

                this.prepareInput(el_text, input_name);

                el_text.setAttribute('data-index',i);
                el_inputs_container.appendChild(el_text);

                // add separator if necessary
                if (i < input_count - 1) {
                    let el_sep = blanke.createElement("p","form-separator");
                    el_sep.innerHTML = extra_args.separator;
                    el_inputs_container.appendChild(el_sep);
                }
            }
        }

        if (input_type == "checkbox") {
            let el_checkbox = blanke.createElement("input","form-checkbox");
            el_checkbox.type = "checkbox";
            el_checkbox.checked = (extra_args.default ? true : false);
            this.prepareInput(el_checkbox, input_name);

            let el_checkmark = blanke.createElement("span","checkmark");

            el_inputs_container.appendChild(el_checkbox);
            el_inputs_container.appendChild(el_checkmark);
            prepend_inputs = true;
        }

        if (input_type == "color") {
            let el_input = blanke.createElement("input","form-color");
            el_input.type = "color";
            this.prepareInput(el_input, input_name);
            el_inputs_container.appendChild(el_input);
        }

        if (input_type == "select") {
            let el_input = blanke.createElement("select","form-select");
            
            if (extra_args.placeholder) {
                let placeholder = app.createElement("option");
                placeholder.selected = (!extra_args.default ? true : false);
                placeholder.disabled = true;
                placeholder.hidden = true;
                placeholder.innerHTML = extra_args.placeholder;
                el_input.appendChild(placeholder);
            }

            // add choices
            for (let c of extra_args.choices) {
                var new_option = app.createElement("option");
                new_option.value = c;
                if (extra_args.default == c) new_option.selected = true;
                new_option.innerHTML = c;
                el_input.appendChild(new_option);
            }

            this.prepareInput(el_input, input_name);
            el_inputs_container.appendChild(el_input);
        }

        if (prepend_inputs)
            el_container.prepend(el_inputs_container);
        else
            el_container.appendChild(el_inputs_container);
        el_container.setAttribute('data-name',input_name);

        this.container.appendChild(el_container);
    }

    removeInput (name) {
        for (var i = 0; i < this.container.children.length; i++) {
            if (this.container.children[i].dataset.name == name) {
                blanke.destroyElement(this.container.children[i]);
            }
        }
    }

    // "private" method
    prepareInput (element, name) {
        element.name_ref = name;
        this.input_ref[name].push(element);
        this.input_values[name].push(0);
    }

    getInput (input_name) {
        if (this.input_ref[input_name].length == 1)
            return this.input_ref[input_name][0];
        return this.input_ref[input_name];
    }

    // if the enter key is pressed while an input is focused
    onEnter (input_name, func) {
        let this_ref = this;
        for (var input of this.input_ref[input_name]) {
            input.addEventListener('keyup', function(e){
                if (event.keyCode === 13)
                    func(e);
            });
        }
    }

    onChange (input_name, func) {
        let this_ref = this;
        for (var input of this.input_ref[input_name]) {
            let event_type = 'input';

            if (["color", "select", "checkbox"].includes(this.input_types[input_name])) event_type = "change";
            if (this.input_types[input_name] == "button") event_type = "click";

            input.addEventListener(event_type, function(e){
                let input_type = this_ref.input_types[e.target.name_ref];
                let input_value = this_ref.input_values[e.target.name_ref];
                let input_ref = this_ref.input_ref[input_name];

                let val;
                if (input_type == "text" || input_type == "select" || input_type == "color")
                    val = e.target.value;
                
                if (input_type == "checkbox")
                    val = this.checked;

                if (input_type == "number")
                    val = parseInt(e.target.value);

                input_value[parseInt(e.target.dataset['index']) || 0] = val;
                let ret_val = func(input_value.length == 1 ? input_value[0] : input_value.slice());
                
                // if values are returned, set the inputs to them
                if (ret_val) {
                    for (var input2 in input_ref) {
                        input_ref[input2].value = ret_val[input2];
                    }
                }
            });
        }
    }

    getValue (input_name, index) {
        index = index || 0;
        if (this.input_types[input_name] == "number")
            return parseFloat(this.input_ref[input_name][index].value);
        else if (this.input_types[input_name] == "checkbox")
            return this.input_ref[input_name][index].checked;
        else
            return this.input_ref[input_name][index].value;
    }

    setValue (input_name, value, index) {
        if (!this.input_ref[input_name]) return;
        index = index || 0;
        if (this.input_types[input_name] == "checkbox")
            this.input_ref[input_name][index].checked = value;
        else
            this.input_ref[input_name][index].value = value;
        this.input_values[input_name][index] = value;
    }

    useValues (inputs) {
        for (let name in inputs) {
            if (Array.isArray(inputs[name])) {
                for (let i in inputs[name]) {
                    this.setValue(name, inputs[name][i], i);
                }
            } else {
                this.setValue(name, inputs[name])
            }
        }
    }
}

var blanke = {
    _windows: {},

    getElement: function(sel) {
        return document.querySelector(sel);
    },

    getElements: function(sel) {
        return document.querySelectorAll(sel);
    },

    createElement: function(el_type, el_class) {
        var ret_el = document.createElement(el_type);
        if (Array.isArray(el_class)) ret_el.classList.add(...el_class);
        else ret_el.classList.add(el_class);
        return ret_el;
    },

    clearElement: function(element) {
        while (element.firstChild) {
            element.removeChild(element.firstChild);
        }
    },

    destroyElement: function(element) {    
        element.parentNode.removeChild(element);
    },

    sortChildren: function(element, fn_compare) {
        let sorted_children = Array.from(element.children);
        sorted_children.sort(fn_compare);
        blanke.clearElement(element);
        for (let e = 0; e < sorted_children.length; e++) {
            element.appendChild(sorted_children[e]);
        }
    },
    
    cooldown_keys: {},
    cooldownFn: function(name, cooldown_ms, fn, overwrite_timer) {
        if (!blanke.cooldown_keys[name]) 
            blanke.cooldown_keys[name] = {
                timer: null,
                func: fn
            }
        
        // reset the timer if necessary
        if (overwrite_timer || blanke.cooldown_keys.timer == null) {
            clearTimeout(blanke.cooldown_keys[name].timer);
            blanke.cooldown_keys[name].timer = setTimeout(function(){
                blanke.cooldown_keys[name].func();
                delete blanke.cooldown_keys[name];
            },cooldown_ms);
        }

        blanke.cooldown_keys[name].func = fn;
    },

    el_toasts: undefined,
    toast: function(text, duration) {
        if (!blanke.el_toasts) {
            blanke.el_toasts = blanke.createElement('div','blankejs-toasts');
            document.body.appendChild(blanke.el_toasts);
        }

        let el_new_toast = blanke.createElement("div","toast-container");
        let el_content = blanke.createElement("p","content");
        let el_br = blanke.createElement("br");
        el_content.innerHTML = text;
        el_new_toast.appendChild(el_content);
        blanke.el_toasts.appendChild(el_new_toast);
        blanke.el_toasts.appendChild(el_br);

        // animation
        Array.from(blanke.el_toasts.children).forEach(function(el) {
            let animation = [
                { transform: 'translateY('+el.offsetHeight+'px)' },
                { transform: 'translateY(0px)' }
            ];
            el.animate(animation, {
                duration: 200,
                iterations: 1,
                easing: 'ease-out'
            });
        });

        setTimeout(function(){
            let animation = el_new_toast.animate([{ opacity:1 }, { opacity:0 }], { duration:200, iterations:1, easing:'ease-in'})
            animation.pause();
            animation.onfinish = function(){
                blanke.destroyElement(el_new_toast);
                blanke.destroyElement(el_br);
            }
            animation.play();
        }, duration || 4000);
    },

    chooseFile: function(type, onChange, filename='', multiple=false) {
        var chooser = document.querySelector("#_blankeFileDialog");
        if (chooser != null) {
           chooser.remove();
        }
        chooser = document.createElement("input");
        chooser.id = "#_blankeFileDialog";
        chooser.style.display = "none";
        chooser.type = "file";
        if (type != '' && filename) chooser.setAttribute(type, filename)
        if (multiple) chooser.setAttribute('multiple','');

        document.body.appendChild(chooser);
        
        chooser.addEventListener("change", function(evt) {
            if (onChange) onChange(this.value);
        }, false);

        chooser.click();
    },

    // possible choices: yes, no (MORE TO COME LATER)
    showModal: function(html_body, choices) {
        html_actions = "";
        choice_keys = Object.keys(choices);

        // fill in action buttons
        for (var c = 0; c < choice_keys.length; c++) {
            var choice_key = choice_keys[c];

            btn_type = "sphere";
            html_inside = choice_key;
            if (choice_key.toLowerCase() == "yes") {
                html_inside = "<i class='mdi mdi-check'></i>"
            }
            else if (choice_key.toLowerCase() == "no") {
                html_inside = "<i class='mdi mdi-close'></i>"
            }
            else {
                html_inside = choice_key
                btn_type = "rect"
            }

            html_actions += "<button class='ui-button-"+btn_type+"' data-action='"+choice_key+"'>"+html_inside+"</button>";
        }

        // add dialog to page
        var uuid = guid();
        var e = document.createElement('div');
        e.innerHTML = 
            "<div class='ui-modal' data-uuid='"+uuid+"'>"+
                "<div class='modal-body'>"+html_body+"</div>"+
                "<div class='modal-actions'>"+html_actions+"</div>"+
            "</div>";
        while(e.firstChild) {
            document.body.appendChild(e.firstChild);
        }

        // bind button events with their choice functions
        choice_keys.forEach(function(c){
            var choice_fn = choices[c];

            blanke.getElement("body > .ui-modal[data-uuid='"+uuid+"'] > .modal-actions > button[data-action='" + c + "']").onclick = function(){
                choice_fn();
                blanke.getElement("body > .ui-modal[data-uuid='"+uuid+"']").remove();
            };
        });
    },

    // selector_parent: selector for where to put the form inputs
    // input_info: inputs template (type, default, ...)
    // user_val: the curret values of the inputs. can be blank object {}
    // fn_onChange: called when an input value changes. args: type, name, value, subcategory
    createForm: function(selector_parent, input_info, user_val, fn_onChange, grouped=false) {
        // populate input section with inputs
        var html_inputs = '';

        for (var subcat in input_info) {
            html_inputs += "<div class='subcategory'><p class='title'>"+subcat.replace("_"," ")+"</p>";

            // get smaller group (for plugins atm)
            if (grouped) {
                user_val = user_val[subcat];
            }

            for (var i = 0; i < input_info[subcat].length; i++) {
                var input = input_info[subcat][i];

                if (!(input.name in user_val)) {
                    user_val[input.name] = input.default;
                }

                var common_attr = ' data-subcategory="'+subcat+'" data-name="'+input.name+'" data-type="'+input.type+'" title="'+ifndef(input.tooltip, "")+'"';
                
                // remove [hidden_name]
                var display_name = input.name.replace(/\[([^\]]+)\]/g,'');

                if (input.type === "bool") {
                    html_inputs += 
                        '<div class="ui-checkbox-label">'+
                            '<label>'+display_name+'</label>'+
                            '<input class="settings-input" type="checkbox" '+common_attr+' '+(user_val[input.name] == "true" || user_val[input.name] == true ? 'checked' : '')+'>'+
                            '<i class="mdi mdi-check"></i>'+
                        '</div>';
                }
                if (input.type === "number") {
                    html_inputs += 
                        '<div class="ui-input-group">'+
                            '<label>'+display_name+'</label>'+
                            '<input class="ui-input" '+common_attr+' type="number" min="'+input.min+'" max="'+input.max+'" step="'+input.step+'" value="'+user_val[input.name]+'">'+
                        '</div>';
                }
                if (input.type === "select") {
                    var options = '';
                    for (var o = 0; o < input.options.length; o++) {
                        options += "<option value='"+input.options[o]+"' "+(input.options[o] === user_val[input.name] ? 'selected' : '')+">"+input.options[o]+"</option>";
                    }
                    html_inputs +=
                        '<div class="ui-input-group">'+
                            '<label>'+display_name+'</label>'+
                            '<select class="ui-select" '+common_attr+'>'+
                                options+
                            '</select>'+
                        '</div>';
                }
                if (input.type === "file") {
                    html_inputs +=
                        '<div class="ui-file">'+
                            '<label>'+display_name+'</label>'+
                            '<button class="ui-button-rect" onclick="'+
                                escapeHtml('chooseFile(\'\',function(path){$(\'input[data-name=\"'+input.name+'\"\').val(path[0]).trigger(\'change\');})')+
                            '">Choose file</button>'+
                            '<input disabled '+common_attr+' type="text" value="'+user_val[input.name]+'">'+
                        '</div>'
                }
                if (input.type === "text" || input.type === "password") {
                    var value = user_val[input.name];

                    // decrypt password
                    if (input.type === "password")
                        value = b_util.decrypt(value)

                    html_inputs +=
                        '<div class="ui-text">'+
                            '<label>'+display_name+'</label>'+
                            '<input '+common_attr+' type="'+input.type+'" value="'+value+'">'+
                        '</div>'
                }
                if (input.type === "button") {
                    if (input.shape == "rectangle") {
                        html_inputs +=
                            '<br>'+
                            '<button class="ui-button-rect" onclick="'+input.function+'">'+display_name+'</button>'+
                            '<br>';
                    }
                }
                if (input.type === "color") {
                    if (input.colors) 
                        $.fn.colorPicker.defaults.colors = input.colors;
                    html_inputs += 
                        '<div class="ui-input-group">'+
                            '<label>'+display_name+'</label>'+
                            '<input class="ui-color" type="color" '+common_attr+' type="color" value="'+ifndef(user_val[input.name], "#ffffff")+'"/></div>'+
                        '</div>';
                }
            } // for-loop

            html_inputs += "</div>";
        }

        $(selector_parent).html("");
        $(selector_parent).html(html_inputs);

        // bind input change events
        $(selector_parent).off('change', 'input,select');
        $(selector_parent).on('change', 'input,select', function(){
            var type = $(this).data("type"); // bool, number, password
            var name = $(this).data("name"); // x, y, width, jump_power, etc...
            var value = $(this).val(); // 3, 1.4, true, ****
            var subcat = $(this).data("subcategory");
            var group = $(this).data("group");

            if (type === "bool")
                value = $(this).is(':checked') ? true : false;
            if (type === "number") 
                value = parseFloat(value);
            // encrypt password
            if (type === "password")
                value = b_util.encrypt(value);

            dispatchEvent("blanke.form.change", {type: type, name: name, value: value, subcategory: subcat, group: group});
            if (fn_onChange) 
                fn_onChange(type, name, value, subcat, group);
        });
    },

    extractDefaults: function(settings) {
        var ret_parameters = {};

        // fill in parameters with default values of audio_settings
        var categories = Object.keys(settings);
        for (var c = 0; c < categories.length; c++) {
            var setting;
            ret_parameters[categories[c]] = {};
            for (var s = 0; s < settings[categories[c]].length; s++) {
                setting = settings[categories[c]][s];
                if (typeof setting.default != "object")
                    ret_parameters[setting.name] = setting.default;
            }
        }

        return ret_parameters;
    },

    createWindow: function(options) {
        var x = options.x;
        var y = options.y;
        var width = options.width;
        var height = options.height;
        var extra_class = options.class;
        var title = options.title;
        var html = ifndef(options.html, '');
        var uuid = ifndef(options.uuid, guid());
        var onClose = options.onClose;
        var onResizeStop = options.onResizeStop;

        if ($(this._windows[uuid]).length > 0) {
            $(this._windows[uuid]).trigger('mousedown');
            return this._windows[uuid];
        }

        var el = "body > .blanke-window[data-guid='"+uuid+"']";
        this._windows[uuid] = el;

        $("body").append(
            "<div class='blanke-window "+extra_class+"' data-guid='"+uuid+"'>"+
                "<div class='title-bar'>"+
                    "<div class='title'>"+title+"</div>"+
                    "<button class='btn-close'>"+
                        "<i class='mdi mdi-close'></i>"+
                    "</button>"+
                "</div>"+
                "<div class='content'>"+html+"</div>"+
            "</div>"
        );
        $(el).fadeIn("fast");

        // set initial position
        $(".blanke-window").css("z-index", "0");
        $(el).css({
            "left": x + "px",
            "top": y + "px",
            "width": width + "px",
            "height": height + "px",
            "z-index": "1"
        });

        $(el).resizable({
            stop: function( event, ui ) {
                if (onResizeStop)
                    onResizeStop(event, ui);
            }
        });

        // bring window to top
        $(el).on("mousedown focus", function(e){
            $(".blanke-window").css("z-index", "0");
            $(this).css("z-index", "1");
        });

        // add title-bar drag listeners
        function _divMove(e) {
            var div = document.querySelector(el);
            div.style.left = (e.clientX - offX) + 'px';
            div.style.top = (e.clientY - offY) + 'px';
        }
        var offX, offY;
        $(el + " > .title-bar").on("mousedown", function(e){
            $(el + " > .content").css("pointer-events", "none");

            var div = $(el)[0];
            offX = e.clientX - parseInt(div.offsetLeft);
            offY = e.clientY - parseInt(div.offsetTop);

            window.addEventListener('mousemove', _divMove, true);
        });

        $(window).on("mouseup", function(e){
            $(el + " > .content").css("pointer-events", "all");
            window.removeEventListener('mousemove', _divMove, true);
        });

        // close event
        $(el + " > .title-bar > .btn-close").on("click", function(e){
            var can_close = true;
            if (onClose) {
                can_close = ifndef(onClose(), true); // if onClose returns false, prevent closing
            }
            if (can_close) {
                $(el).remove();
            }       
        });

        return el;
    }
}

