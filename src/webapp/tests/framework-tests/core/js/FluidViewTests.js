/*
Copyright 2008-2010 University of Cambridge
Copyright 2008-2009 University of Toronto

Licensed under the Educational Community License (ECL), Version 2.0 or the New
BSD license. You may not use this file except in compliance with one these
Licenses.

You may obtain a copy of the ECL 2.0 License and BSD License at
https://source.fluidproject.org/svn/LICENSE.txt
*/

/*global jQuery, fluid, jqUnit, start, stop, window*/


fluid.registerNamespace("fluid.tests");

(function ($) {

    fluid.setLogging(true);

    fluid.tests.testView = function () {
 
        var fluidViewTests = new jqUnit.TestCase("Fluid View Tests");
      
        fluid.tests.blurTester = function (container, options) {
            var that = fluid.initView("fluid.tests.blurTester", container, options);
            return that;  
        };
     
        fluid.defaults("fluid.tests.blurTester", {
            selectors: {
                select: "select",
                input: "input",
                div: "#component-3",
                excluded: ".excluded",
                excludedParent: ".excludedParent"
            }
        });
     
        function noteTime() {
            jqUnit.assertTrue("Time : " + fluid.renderTimestamp(new Date()), true);  
        }
     
        // This function is necessary since simulation of focus events by jQuery under IE
        // is not sufficiently good to intercept the "focusin" binding.
        function applyOp(node, func) {
            var raw = fluid.unwrap(node);
            raw[func] ? raw[func]() : node[func]();   
        }
     
        function blurTest(message, provokeTarget, provokeOp, shouldBlur, excludeMaker) { 
            fluidViewTests.test("Dead man's blur test - " + message, function () {
               
                noteTime();
                
                var blurReceived = false;
                var blurTester = fluid.tests.blurTester("#blurrable-widget");
                var input = blurTester.locate("input");
                var excluded = $("<div></div>").addClass("excludedParent");
                blurTester.container.append(excluded);
                 
                var blurHandler = function () {
                    if (!blurReceived) {
                        jqUnit.assertTrue(message + " - Blur handler should " + (shouldBlur ? "" : "not ") + "execute", shouldBlur);
                        noteTime();
                        blurReceived = true;
                    }
                };
                var blurrer = fluid.deadMansBlur(input, {
                    delay: 300,
                    exclusions: excludeMaker(blurTester),
                    handler: blurHandler 
                });
                
                excluded.append($("<input></input>").addClass("excluded"));
                
                input.focus();
                 
                var blurOutwaiter = function () {
                    jqUnit.assertTrue(message + " - Blur handler has not executed", shouldBlur ^ !blurReceived);
                    noteTime();
                    start();
                };
    
                input.blur();
                window.setTimeout(function () {
                    fluid.log("Apply " + provokeOp + " to " + provokeTarget);
                    applyOp(blurTester.locate(provokeTarget), provokeOp);
                }, blurrer.options.delay - 100);
                 
                window.setTimeout(blurOutwaiter, blurrer.options.delay + 300);
                 
                stop();
            });
        }
     
        var selectExclusions = function (dom) {
            return {selection: dom.locate("select")};
        };

        var bothExclusions = function (dom) {
            return {
                selection: dom.locate("select"),
                div:  dom.locate("div")
            };
        };
        
        var excludedExclusions = function (dom) {
            return {excludedParent: dom.locate("excludedParent")};
        };
     
        blurTest("nonExcluded component one", "div", "click", true, selectExclusions);
        blurTest("excluded component one", "select", "focus", false, selectExclusions);
     
        blurTest("excluded component two - a", "div", "click", false, bothExclusions);
        blurTest("excluded component two - b", "select", "focus", false, bothExclusions);
        
        blurTest("excluded component excluded", "excluded", "focus", false, excludedExclusions);
     
        fluidViewTests.test("ARIA labeller test", function () {
            var target = $("#component-3");
            var labeller = fluid.updateAriaLabel(target, "Label 1");
            var attr = target.attr("aria-label");
            jqUnit.assertValue("Target must be labelled", attr);
            jqUnit.assertEquals("Target label", "Label 1", attr);
            labeller.update({text: "Label 2"});
            jqUnit.assertEquals("Label updated", "Label 2", target.attr("aria-label"));
        });
        
        fluidViewTests.test("ARIA labeller live region test", function () {
            var target = $("#component-3");
            var labeller = fluid.updateAriaLabel(target, "Label 1", {
                dynamicLabel: true
            });
            
            var region = fluid.jById(fluid.defaults("fluid.ariaLabeller").liveRegionId);
            jqUnit.assertEquals("Live region should have the correct label", "Label 1", region.text());
            labeller.update({
                text: "Label 2",
                dynamicLabel: true
            });
            jqUnit.assertEquals("The live region should be updated", target.attr("aria-label"), region.text());
        });
        
        fluidViewTests.test("fluid.scrollableTable", function () {
            var table = $("#scrollableTable");
            table.css("height", "1px");
            
            var scroller = fluid.scrollableTable(table, {
                css: {
                    height: "1px"
                }
            });
            
            jqUnit.assertTrue("The table's parent element is a div", table.parent().is("div"));
            jqUnit.assertTrue("The table's parent element has the fl-table-scrollable-area class",
                              table.parent().hasClass("fl-table-scrollable-area"));
            jqUnit.assertTrue("The table's grandparent element has the fl-table-scrollable-container class",
                              table.parent().parent().hasClass("fl-table-scrollable-container"));
            jqUnit.assertEquals("The appropriate styles were injected.",
                                "1px", table.parent().css("height"));
        });
    };
   
})(jQuery); 