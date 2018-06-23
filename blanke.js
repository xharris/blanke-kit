// requires jQuery Color Picker (http://www.laktek.com/2008/10/27/really-simple-color-picker-in-jquery/)

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

class BlankeForm {
    /*  inputs = [ [input_name, input_type, {other_args}] ]
        
        input types (input_type {extra_args})
            - text {
                inputs = 1, number of input boxes
                separator = '', separator between multiple input boxes
            }
    */
    constructor (inputs) {
        this.container = blanke.createElement("div", "form-container");
        this.arg_inputs = inputs;
        this.input_ref = {};
        this.input_values = {};
        this.input_types = {};

        for (var input of inputs) {
            let el_container    = blanke.createElement("div", "form-group");
            let el_label        = blanke.createElement("p", "form-label");
            let el_inputs_container=blanke.createElement("div","form-inputs");

            let input_name = input[0];
            let input_type = input[1];
            let extra_args = input[2] || {};
            this.input_ref[input_name] = [];
            this.input_values[input_name] = [];
            this.input_types[input_name] = input_type;

            let show_label = extra_args['label'] || true;

            el_container.setAttribute("data-type", input_type);

            el_label.innerHTML = input_name;
            if (show_label) el_container.appendChild(el_label);

            if (input_type == "text" || input_type == "number") {
                let input_count = 1;
                if (extra_args.inputs) input_count = extra_args.inputs;
                el_container.setAttribute("data-size", input_count);

                // add inputs
                for (var i = 0; i < input_count; i++) {
                    let el_input = blanke.createElement("input","form-text");
                    el_input.value = 0;
                    el_input.type = input_type;

                    this.prepareInput(el_input, input_name);

                    el_input.setAttribute('data-index',i);
                    el_inputs_container.appendChild(el_input);

                    // add separator if necessary
                    if (i < input_count - 1) {
                        let el_sep = blanke.createElement("p","form-separator");
                        el_sep.innerHTML = extra_args.separator;
                        el_inputs_container.appendChild(el_sep);
                    }
                }
            }

            if (input_type == "color") {
                let el_input = blanke.createElement("input","form-color");
                el_input.type = "color";
                this.prepareInput(el_input, input_name);
                el_inputs_container.appendChild(el_input);
            }

            if (input_type == "select") {
                let el_input = blanke.createElement("select","form-select");
                /*
                if (extra_args.placeholder) {
                    let placeholder = app.createElement("option");
                    placeholder.selected = true;
                    placeholder.disabled = true;
                    placeholder.value = input_name;
                    el_input.appendChild(placeholder);
                }*/

                // add choices
                for (let c of extra_args.choices) {
                    var new_option = app.createElement("option");
                    new_option.value = c;
                    new_option.innerHTML = c;
                    el_input.appendChild(new_option);
                }

                this.prepareInput(el_input, input_name);
                el_inputs_container.appendChild(el_input);
            }

            el_container.appendChild(el_inputs_container);
            el_container.setAttribute('data-name',input_name);

            this.container.appendChild(el_container);
        }
    }

    // "private" method
    prepareInput (element, name) {
        element.name_ref = name;
        this.input_ref[name].push(element);
        this.input_values[name].push(0);
    }

    onChange (input_name, func) {
        let this_ref = this;
        for (var input of this.input_ref[input_name]) {
            let event_type = 'input';

            if (["color", "select"].includes(this.input_types[input_name])) event_type = "change";

            input.addEventListener(event_type, function(e){
                let input_type = this_ref.input_types[e.target.name_ref];
                let input_value = this_ref.input_values[e.target.name_ref];
                let input_ref = this_ref.input_ref[input_name];

                if (input_type == "text" || input_type == "select")
                    input_value[parseInt(e.target.dataset['index']) || 0] = e.target.value;
                
                if (input_type == "number")
                    input_value[parseInt(e.target.dataset['index']) || 0] = parseInt(e.target.value);

                let ret_val = func(input_value.slice());
                
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
        return this.input_ref[input_name][index].value;
    }

    setValue (input_name, value, index) {
        index = index || 0;
        this.input_ref[input_name][index].value = value;
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

    cooldown_keys: {},
    cooldownFn: function(name, cooldown_ms, fn) {
        if (blanke.cooldown_keys[name])
            clearTimeout(blanke.cooldown_keys[name])
        blanke.cooldown_keys[name] = setTimeout(fn, cooldown_ms);
    },

    el_toasts: undefined,
    toast: function(text) {
        if (!blanke.el_toasts) {
            blanke.el_toasts = blanke.createElement('div','blankejs-toasts');
            document.body.appendChild(blanke.el_toasts);
        }

        let el_new_toast = blanke.createElement("div","toast-container");
        let el_content = blanke.createElement("p","content");
        el_content.innerHTML = text;
        el_new_toast.appendChild(el_content);
        blanke.el_toasts.appendChild(el_new_toast);

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
            animation.onfinish = function(){ blanke.destroyElement(el_new_toast); }
            animation.play();
        }, 4000);
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

