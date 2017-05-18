"use strict";

var iceAge = {
    labelArray: [],
    iconArray: ["potablewater", "restrooms"],
    jsonString: '',
    totalTrailDistance: 0,
    position : '',

    /*
    ******************
    Start of App
    ******************
    */
    init: function() {
            iceAge.getLabelsFromWebPage();
            iceAge.getJsonFromWebPage();
    },

    /*
    ******************
    Attach Event Listeners
    ******************
    */
    attachEventListeners: function() {

        $('#segment_filter').on('click', 'a', function(e) {
            e.preventDefault();

            var segment = $(this).attr('href');

            $('#segment_filter li').removeClass('selected');
            $(this).parent('li').addClass('selected');


            $('.county').hide();
            $('[data-index="' + segment + '"]').show();

        });

        $('#segments').on('click', function(e){
            $('#progress_container').hide();
            $('#segment_container').show();
            $('#nav div').removeClass('selected');
            $(this).addClass('selected');
            
        });

        $('#progress').on('click', function(e){
            $('#segment_container').hide();
            $('#progress_container').show();
            $('#nav div').removeClass('selected');
            $(this).addClass('selected');
        });

        $('body').on('keyup', function(e) {

                if (e.keyCode == 39) {
                    var nextElement = $('#segment_filter li.selected');

                    if($(nextElement).next().length > 0){
                        $('#segment_filter li').removeClass('selected');
                        $(nextElement).next().addClass('selected');
                        $('#segment_filter li.selected a').click();
                    }
                   
                } else if (e.keyCode == 37) {
                    var nextElement = $('#segment_filter li.selected');

                    if($(nextElement).prev().length > 0){
                        $('#segment_filter li').removeClass('selected');
                        $(nextElement).prev().addClass('selected');
                        $('#segment_filter li.selected a').click();
                    }
                    
                }

                if (e.keyCode == 83) {
                    iceAge.enableSpeech();
                }

        });
    },

    /*
     **Retrive Labels from table and put into array
     **ID was added in
     */
    getLabelsFromWebPage: function() {

        $("#labels").children("td").each(function(index) {
            var label = $(this).text();
            label = label.toLowerCase();
            label = label.replace(/\s+/g, '');
            label = label.replace(/�/g, '');
            iceAge.labelArray.push(label);
        });
    },
    /*
     **Build JSON from table and console JSON object
     */
    getJsonFromWebPage: function() {
        var rowCount = $("tr").length - 1;


        iceAge.jsonString += '[';

        $("tr").each(function(index) {
            if (index > 0) {
                iceAge.jsonString += '{';
                var columnCount = $(this).children('td').length - 1;

                $(this).children('td').each(function(index) {

                    //  iceAge.jsonString += '"' + iceAge.labelArray[index] + '":';

                    //  if (index == 1 || index == 4) {
                    var cellText = $(this).text();
                    cellText = cellText.replace(/\s\s+/g, ' ');
                    cellText = cellText.replace(/�/g, '');

                    iceAge.jsonString += '"' + iceAge.labelArray[index] + '":';
                    iceAge.jsonString += '"' + cellText + '"';

                    //use var columnCount if reading everything in JSON
                    if (index != columnCount) {
                        iceAge.jsonString += ',';
                    }
                    //  }
                });

                iceAge.jsonString += '}';
                if (index < rowCount) {
                    iceAge.jsonString += ',';
                }
            }
        });

        iceAge.jsonString += ']';
        console.log(iceAge.jsonString);
    },

    formatData : function(){
        var countyObject = {},
            segmentObject = {},
            text = '';

        for (var i = 0; i < ice_age_data.length; i++) {
            
            countyObject.id = i + 1;
            countyObject.countyName = ice_age_data[i].booksection;
        }

        console.log(countyObject);

    }
};

$(document).ready(function() {
    iceAge.init();
});