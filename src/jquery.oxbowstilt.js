﻿/*
* jQuery Oxbowstilt Widget 0.9
* A low-fi dual-listbox multiselect widget
* Copyright (c) 2012 Ian Richardson
*
* http://www.codeulike.com
*
* Depends:
*   - jQuery 1.4.2+
*   - jQuery UI 1.8 widget factory
**
* Dual licensed under the MIT and GPL licenses:
*   http://www.opensource.org/licenses/mit-license.php
*   http://www.gnu.org/licenses/gpl.html
*
*/
(function($) {

    $.widget("cdu.oxbowstilt", {

        // default options
        options: {
            height: 300,
            listWidth: 200,
            chosenLabel: "Chosen",
            unchosenLabel: "Available",
            onChoose: null,
            onUnchoose: null
        },
        _ie7: false,
		_useExistingSelects: false,

        _create: function() {
			if (this.element.is("div"))
			{
				this.listContainer = this.element;
				this.chosenList = $(this.element.find("select")[0]);
				this.unchosenList = $(this.element.find("select")[1]);
				this._useExistingSelects = (this.chosenList && this.unchosenList);
			}
			
			if (this._useExistingSelects)
				this._createFromExistingSelects();
			else
				this._createFromScratch();
            
            var self = this;
            this.chooseButton.bind("click.oxbowstilt", function() { self._chooseSelected(); });
            this.unchooseButton.bind("click.oxbowstilt", function() { self._unchooseSelected(); });
            this.unchosenList.bind("dblclick.oxbowstilt", function() { self._chooseSelected(); });
            this.chosenList.bind("dblclick.oxbowstilt", function() { self._unchooseSelected(); });
            this._ie7 = (jQuery.browser.msie && jQuery.browser.version < 8);
            var ie8orEarlier = (jQuery.browser.msie && jQuery.browser.version < 9);
            if (ie8orEarlier) {
                // prevent bubble of mousedown events on selects
                // see jquery ui bug #6644 http://bugs.jqueryui.com/ticket/6644
                this.unchosenList.bind('mousedown.oxbowstilt', false);
                this.chosenList.bind('mousedown.oxbowstilt', false);
            }
            this.refresh();
        },
		_createFromScratch: function () {
		
			this.element.hide();
			
            this.listContainer = $("<div />").addClass("ui-oxbowstilt-container").insertAfter(this.element);
            this.chosenWrapper = $("<div />").addClass("ui-oxbowstilt-listwrap").appendTo(this.listContainer);
            this.chosenLabel = $("<span>" + this.options.chosenLabel + "</span>").addClass("ui-oxbowstilt-listheader").appendTo(this.chosenWrapper);
            this.chosenList = $("<select multiple=\"multiple\" size=\"10\" \>").addClass("ui-oxbowstilt-list").appendTo(this.chosenWrapper);
            this.chosenList.width(this.options.listWidth).height(this.options.height);
            this.middleBit = $("<div />").addClass("ui-oxbowstilt-middle").appendTo(this.listContainer);
            this.unchosenWrapper = $("<div />").addClass("ui-oxbowstilt-listwrap").appendTo(this.listContainer);
            this.unchosenLabel = $("<span>" + this.options.unchosenLabel + "</span>").addClass("ui-oxbowstilt-listheader").appendTo(this.unchosenWrapper);
            this.unchosenList = $("<select multiple=\"multiple\" size=\"10\" \>").addClass("ui-oxbowstilt-list").appendTo(this.unchosenWrapper);
            this.unchosenList.width(this.options.listWidth).height(this.options.height);
            this.clearDiv = $("<div />").addClass("ui-helper-clearfix").appendTo(this.listContainer);
            this.chooseButton = $("<button type=\"button\" >&lt;</button>").addClass("ui-oxbowstilt-button").appendTo(this.middleBit).button();
            this.unchooseButton = $("<button type=\"button\" >&gt;</button>").addClass("ui-oxbowstilt-button").appendTo(this.middleBit).button();
		
		},
		_createFromExistingSelects: function () {
			// listcontainer already exists, just need to add class
			this.listContainer.addClass("ui-oxbowstilt-container");
			this.chosenList.wrap("<div />");
            this.chosenWrapper =  this.chosenList.parent().addClass("ui-oxbowstilt-listwrap");
            this.chosenLabel = $("<span>" + this.options.chosenLabel + "</span>").addClass("ui-oxbowstilt-listheader").prependTo(this.chosenWrapper);
            this.chosenList.addClass("ui-oxbowstilt-list");
            this.chosenList.width(this.options.listWidth).height(this.options.height);
            $("<div />").addClass("ui-oxbowstilt-middle").insertAfter(this.chosenWrapper);
			this.middleBit = this.chosenWrapper.next();
			
			this.unchosenList.wrap("<div />");
            this.unchosenWrapper = this.unchosenList.parent().addClass("ui-oxbowstilt-listwrap");
            this.unchosenLabel = $("<span>" + this.options.unchosenLabel + "</span>").addClass("ui-oxbowstilt-listheader").prependTo(this.unchosenWrapper);
            this.unchosenList.addClass("ui-oxbowstilt-list");
            this.unchosenList.width(this.options.listWidth).height(this.options.height);
            this.clearDiv = $("<div />").addClass("ui-helper-clearfix").appendTo(this.listContainer);
            this.chooseButton = $("<button type=\"button\" >&lt;</button>").addClass("ui-oxbowstilt-button").appendTo(this.middleBit).button();
            this.unchooseButton = $("<button type=\"button\" >&gt;</button>").addClass("ui-oxbowstilt-button").appendTo(this.middleBit).button();
		
		},

        refresh: function() {
			if (this._useExistingSelects)
				return;
            var chosenOps = [];
            var unchosenOps = [];
            this.element.find('option').each(function(i) {
                var desc = $(this).text();
                var val = this.value;
                var isSelected = this.selected;

                var html = "<option value=\"" + val + "\">" + desc + "</option>";

                if (isSelected)
                    chosenOps.push(html);
                else
                    unchosenOps.push(html);
            });

            // insert into the DOM
            this.chosenList.html(chosenOps.join(''));
            this.unchosenList.html(unchosenOps.join(''));
        },
        _chooseSelected: function() {            
            var chooseList = this.unchosenList.val();
            this.choose(chooseList, true);
        },
        _unchooseSelected: function() {
            //var unchooseList = $.map(this.chosenList.children(":selected"), function(e) { return $(e).val(); });
            var unchooseList = this.chosenList.val();
            this.unchoose(unchooseList, true);
        },
        choose: function(chooseList, allowCallback) {
            if (this._ie7) {
                this.chosenList.hide();
                this.unchosenList.hide();
            }
            for (i = 0; i < chooseList.length; i++) {
                this._moveItem(chooseList[i], this.unchosenList, this.chosenList);
				if (!this._useExistingSelects)
					this._updateOriginalItem(chooseList[i], true);
            }
            if (this._ie7) {
                this.chosenList.show();
                this.unchosenList.show();
            }
            if (allowCallback) {
                var callback = this.options.onChoose;
                if ($.isFunction(callback))
                    callback(chooseList);
            }
        },
        unchoose: function(unchooseList, allowCallback) {
            if (this._ie7) {
                this.chosenList.hide();
                this.unchosenList.hide();
            }
            for (i = 0; i < unchooseList.length; i++) {
                this._moveItem(unchooseList[i], this.chosenList, this.unchosenList);
				if (!this._useExistingSelects)
					this._updateOriginalItem(unchooseList[i], false);
            }
            if (this._ie7) {
                this.chosenList.show();
                this.unchosenList.show();
            }
            if (allowCallback) {
                var callback = this.options.onUnchoose;
                if ($.isFunction(callback))
                    callback(unchooseList);
            }
        },
        _moveItem: function(val, from, to) {
            var $elementToMove = $(from.children("option[value='" + val + "']")[0]);
            var desc = $elementToMove.text();
            $elementToMove.remove();
            var html = "<option value=\"" + val + "\">" + desc + "</option>";
            to.append(html);
        },
        _updateOriginalItem: function(val, selected) {
            var originalItem = this.element.children("option[value='" + val + "']")[0];
            if (selected)
                $(originalItem).attr('selected', 'selected');
            else
                $(originalItem).removeAttr('selected');
            
        },
        destroy: function() {
            // remove classes + data
            $.Widget.prototype.destroy.call(this);

			if (this._useExistingSelects)
			{
				this.middleBit.remove();
				this.clearDiv.remove();
				this.unchosenList.removeClass("ui-oxbowstilt-list");
				this.unchosenLabel.remove();
				this.unchosenList.unwrap();
				this.chosenList.removeClass("ui-oxbowstilt-list");
				this.chosenLabel.remove();
				this.chosenList.unwrap();
				this.listContainer.removeClass("ui-oxbowstilt-container");
				
				this.unchosenList.unbind(".oxbowstilt");
				this.chosenList.unbind(".oxbowstilt");
			}
			else
			{
				this.listContainer.remove();
				this.element.show();
			}

            return this;
        }




    });

})(jQuery);