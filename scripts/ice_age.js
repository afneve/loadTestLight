"use strict";

var iceAge = {
    iconArray: ["potablewater", "restrooms"],
    totalTrailDistance: 0,
    totalSegments: 0,
    distanceArray: [],
    distanceObject: {},
    elevationArray: [],
    elevationObject: {},
    ruggednessArray: [],
    ruggednessObject: {},
    position: '',
    secondaryPosition: '',
    usingTrelloData: true,
    boardId: "DVxLVaPD",
    unfinishedListId: "58af2c5dd7bafea5adf572d4",
    partialListId: "58af2c61471ef75d38fc78d4",
    completeListId: "58af2c62a582aace8e45d928",
    trelloCompleteArray: [],
    trelloPartialArray: [],
    permissionId: ["id1", "id2"],
    trelloCounter: 0,
    useGeo: false,

    /*
    ******************
    Start of App
    ******************
    */
    init: function() {
        for(var i = 0; i < 10000; i++){

        }
        return false;
        var loc = window.location.host,
            parameters = window.location.search;
        if (loc.includes('afneve')) {
            iceAge.useGeo = true;

            if(parameters.includes('disableData')){
                iceAge.usingTrelloData = false;
            }
        }
        else{
            iceAge.usingTrelloData = false
        }

        if (iceAge.usingTrelloData) {
            iceAge.AuthenticateTrello();
            if(!iceAge.usingTrelloData){
                iceAge.loadApp();
            }
        } else {
            iceAge.loadApp();
        }

    },
    AuthenticateTrello: function() {
        iceAge.usingTrelloData = false;
		if(typeof Trello != 'undefined'){
			Trello.authorize({
				name: "Ice Age",
				type: "redirect",
				expiration: "never",
				persist: true,
				iteractive: true,
                return_url: "https://afneve.github.io/iceage/",
                callback_method: "fragment", 
				key: "a4e071c48e784cee49ab732a869095d6",
				success: function() {
					iceAge.usingTrelloData = true;
					iceAge.updateLoggedIn();
					var token = Trello.token();
					iceAge.loadTrelloData();
				},
				error: function(e) {
                    alert("ERROR");
					iceAge.usingTrelloData = false;
					console.log(e);
					iceAge.loadApp();
				},
				scope: {
					read: true
				},
			});
		}
    },
    updateLoggedIn: function() {
        //Trello.unauthorize();
        var isLoggedIn = Trello.authorized();
        $("#loggedout").toggle(!isLoggedIn);
        $("#loggedin").toggle(isLoggedIn);
    },
    loadTrelloData: function() {
        var completeId = '',
            completeExtra = '',
            partialId = '',
            partialExtra = '';

        Trello.get("lists/" + iceAge.completeListId + "/cards", function(cl) {
            var tempArray = [];

            iceAge.trelloCompleteArray = [];

            for (var i = 0; i < cl.length; i++) {
                tempArray = cl[i].desc.split('|');
                completeId = tempArray[0];
                completeExtra = tempArray[1];

                if (completeId !== "") {
                    completeId = completeId.split(':')[1].trim();
                }
                if (completeExtra !== "") {
                    completeExtra = completeExtra.trim();
                }

                var complete = {
                    segmentId: completeId,
                    dateOfCompletion: completeExtra
                };
                iceAge.trelloCompleteArray.push(complete);
            }


            Trello.get("lists/" + iceAge.partialListId + "/cards", function(pl) {
                var tempArray = [];

                iceAge.trelloPartialArray = [];

                for (var j = 0; j < pl.length; j++) {
                    tempArray = pl[j].desc.split('|');
                    partialId = tempArray[0];
                    partialExtra = tempArray[1];
                    if (partialId !== "") {
                        partialId = partialId.split(':')[1].trim();
                    }
                    if (partialExtra !== "") {
                        partialExtra = partialExtra.trim();
                    }

                    var partial = {
                        segmentId: partialId,
                        notes: partialExtra
                    };
                    iceAge.trelloPartialArray.push(partial);

                }

                for (var u = 0; u < progress_data.users.length; u++) {
                    if (progress_data.users[u].userId == 2) {
                        progress_data.users[u].completedSegments = iceAge.trelloCompleteArray;
                        progress_data.users[u].partialSegments = iceAge.trelloPartialArray;
                    }
                }

                iceAge.loadApp();
            });

        });

    },
    loadApp: function() {
        var parameters = window.location.search;
        if (navigator.geolocation && iceAge.useGeo) {
            navigator.geolocation.getCurrentPosition(function(position) {
                iceAge.position = position;

                if(parameters.includes('lat') && parameters.includes('long')){
                    var lat = parseFloat(parameters.substring(parameters.indexOf('lat=') + 4, parameters.indexOf('&long')));
                    var long = parseFloat(parameters.substring(parameters.indexOf('long=') + 5, parameters.length));
                    var latLongObj = {'latitude': lat, 'longitude': long};

                    iceAge.secondaryPosition = latLongObj;
                }
                iceAge.dataCollection();
                iceAge.displaySegmentList();
            }, function() {
                iceAge.dataCollection();
                iceAge.displaySegmentList();
            });
        } else {
            iceAge.dataCollection();
            iceAge.displaySegmentList();
        }

        iceAge.attachEventListeners();
    },

    /*
    ******************
    Organize Trail Data into Arrays
    ******************
    */
    dataCollection: function() {
        for (var i = 0; i < ice_age_data.length; i++) {
            iceAge.distanceArray.push(parseFloat(ice_age_data[i].iceagetraildistance));
            iceAge.elevationArray.push(parseFloat(ice_age_data[i].elevation));
            iceAge.ruggednessArray.push(parseFloat(ice_age_data[i].ruggedness));
        }

        iceAge.getAverage(iceAge.distanceArray, iceAge.distanceObject);
        iceAge.getAverage(iceAge.elevationArray, iceAge.elevationObject);
        iceAge.getAverage(iceAge.ruggednessArray, iceAge.ruggednessObject);
    },

    /*
    ******************
    Get Average of trail data to use later
    ******************
    */
    getAverage: function(array, object) {
        var average = 0;

        for (var i = 0; i < array.length; i++) {
            average += array[i];
        }

        average = (average / array.length).toFixed(2);

        object.average = parseFloat(average);

        array.sort(function(a, b) {
            return a - b;
        });

        object.lowest = array[0];
        object.highest = array[array.length - 1];
        object.shortCutoff = parseFloat(((object.average + object.lowest) / 2).toFixed(2));
        object.midCutoff = parseFloat(((object.average + object.highest) / 2).toFixed(2));
    },

    /*
    ******************
    Retrieves data and put it on the page
    ******************
    */
    displaySegmentList: function() {
        var segmentHTML = '',
            filterHTML = '',
            selectHTML = '',
            weatherHTML = '',
            previousSection = '',
            nextSection = '',
            difficulty = '',
            usersCompleteArray = [],
            usersPartialArray = [],
            countyCompleteArray = [],
            countyCounter = 1,
            allComplete = true;

        selectHTML += '<select>';

        iceAge.totalSegments = ice_age_data.length;

        for (var i = 0; i < ice_age_data.length; i++) {
            ice_age_data[i].segment_id = i + 1;

            usersCompleteArray = iceAge.usersWhoHaveCompletedSegment(i + 1);
            usersPartialArray = iceAge.usersWhoHavePartialSegment(i + 1);

            iceAge.totalTrailDistance += parseFloat(ice_age_data[i].iceagetraildistance);

            if (usersCompleteArray.length == 2 && allComplete) {
                allComplete = true;
            }
            else{
                allComplete = false;
            }

            //IF NEW COUNTY
            if (ice_age_data[i].booksection != previousSection) {

                if (usersCompleteArray.length == 2) {
                    allComplete = true;
                }

                if (i === 0) {
                    segmentHTML += '<div class="county" data-index="' + countyCounter + '">';
                } else {
                    segmentHTML += '<div class="county hide" data-index="' + countyCounter + '">';
                }

                if(ice_age_data[i].booksection.includes('/')){
                    weatherHTML = ice_age_data[i].booksection.split('/')[1];
                }
                else if(ice_age_data[i].booksection.includes('&')){
                    weatherHTML = ice_age_data[i].booksection.split('&')[1];
                }
                else{
                    weatherHTML = ice_age_data[i].booksection;
                }

                segmentHTML += '<h2 class="county_name"><a target="_blank" href ="https://www.google.com/#q=' + weatherHTML + '+wi+weather">' + ice_age_data[i].booksection + '</a></h2>';

                if (i === 0) {
                    filterHTML += '<li class="selected">';
                } else {
                    filterHTML += '<li>';
                }
                selectHTML += '<option value="' + countyCounter + '">' + ice_age_data[i].booksection + '</option>';
                filterHTML += '<a data-index="' + countyCounter + '" href="' + countyCounter + '">' + ice_age_data[i].booksection + '</a>';
                filterHTML += '</li>';

                countyCounter++;
            }

            segmentHTML += '<div class="segment_container">';
            segmentHTML += '<div class="segment" data-index="' + (i + 1) + '">';
            segmentHTML += '<h3 class="segment_name">' + ice_age_data[i].segment + '</h3>';
            segmentHTML += '<div class="segment_summary">' + ice_age_data[i].summary + '</div>';


            segmentHTML += '<div class="segment_info">';

            difficulty = iceAge.getDifficultyLevel(parseFloat(ice_age_data[i].iceagetraildistance), iceAge.distanceObject.shortCutoff, iceAge.distanceObject.midCutoff);
            segmentHTML += '<div class="' + difficulty + '">Distance: ' + ice_age_data[i].iceagetraildistance + '</div>';

            difficulty = iceAge.getDifficultyLevel(parseFloat(ice_age_data[i].elevation), iceAge.elevationObject.shortCutoff, iceAge.elevationObject.midCutoff);
            segmentHTML += '<div class="' + difficulty + '">Elevation: ' + ice_age_data[i].elevation + '</div>';

            difficulty = iceAge.getDifficultyLevel(parseFloat(ice_age_data[i].ruggedness), iceAge.ruggednessObject.shortCutoff, iceAge.ruggednessObject.midCutoff);
            segmentHTML += '<div class="' + difficulty + '">Ruggedness: ' + ice_age_data[i].ruggedness + '</div>';

            segmentHTML += iceAge.displayInfoWithIcon('potablewater', ice_age_data[i].potablewater);
            segmentHTML += iceAge.displayInfoWithIcon('restrooms', ice_age_data[i].restrooms);
            segmentHTML += '<div>Connecting route distance: ' + ice_age_data[i].connectingroutedistance + '</div>';

            segmentHTML += '<div class="atlas">Atlas Map: ' + ice_age_data[i].atlasmap + '</div>';

            /*
             *Loop to get Coordinates for Segment and display links
             */
            for (var j = 0; j < segment_id_location_data.length; j++) {
                if (segment_id_location_data[j].segment_id == ice_age_data[i].segment_id) {
                    var eastLat = iceAge.convertCoord(segment_id_location_data[j].eastLat),
                        eastLong = iceAge.convertCoord(segment_id_location_data[j].eastLong),
                        westLat = iceAge.convertCoord(segment_id_location_data[j].westLat),
                        westLong = iceAge.convertCoord(segment_id_location_data[j].westLong);

                    segmentHTML += '<div class="map">';
                    if (westLat !== '') {
                        segmentHTML += '<div class="terminus_container">Western Terminus: <a class="location" target="_blank" href="https://www.google.com/maps/place/' + westLat + 'N+' + westLong + 'W" >' + ice_age_data[i].westernterminus + ' ( ' + segment_id_location_data[j].west_gps_id + ' )</a></div>';
                    }
                    if (eastLat !== '') {
                        segmentHTML += '<div class="terminus_container">Eastern Terminus: <a class="location" target="_blank" href="https://www.google.com/maps/place/' + eastLat + 'N+' + eastLong + 'W" >' + ice_age_data[i].easternterminus + ' ( ' + segment_id_location_data[j].east_gps_id + ' )</a></div>';
                    }
                    if (eastLat !== '' && westLat !== '') {
                        segmentHTML += '<a class="location" target="_blank" href="https://www.google.com/maps/dir/' + eastLat + 'N+' + eastLong + 'W/' + westLat + 'N+' + westLong + 'W">Beginning to End</a>';
                    }

                    if (iceAge.position !== '') {
                        if (westLat !== '') {
                            segmentHTML += '<div class="location_based_info">';
                            segmentHTML += '<a class="location" target="_blank" href="https://www.google.com/maps/dir/' + iceAge.position.coords.latitude + '+' + iceAge.position.coords.longitude + '/' + westLat + 'N+' + westLong + 'W">Directions to West End</a>';
                            segmentHTML += '<div class="getDistance" data-lat="' + westLat + '" data-long="' + westLong + '"></div>';
                            if(iceAge.secondaryPosition !== ''){
                                segmentHTML += '<div class="secondary_location">'
                                segmentHTML += '<a class="location" target="_blank" href="https://www.google.com/maps/dir/' + iceAge.secondaryPosition.latitude + '+' + iceAge.secondaryPosition.longitude + '/' + westLat + 'N+' + westLong + 'W">Secondary Directions to West End</a>';
                                segmentHTML += '<div class="getSecondaryDistance" data-lat="' + westLat + '" data-long="' + westLong + '"></div>';
                                segmentHTML += '</div>';
                            }
                            segmentHTML += '</div>';
                        }

                        if (eastLat !== '') {
                            segmentHTML += '<div class="location_based_info">';
                            segmentHTML += '<a class="location" target="_blank" href="https://www.google.com/maps/dir/' + iceAge.position.coords.latitude + '+' + iceAge.position.coords.longitude + '/' + eastLat + 'N+' + eastLong + 'W">Directions to East End</a>';
                            segmentHTML += '<div class="getDistance" data-lat="' + eastLat + '" data-long="' + eastLong + '"></div>';
                            if(iceAge.secondaryPosition !== ''){
                                segmentHTML += '<div class="secondary_location">'
                                segmentHTML += '<a class="location" target="_blank" href="https://www.google.com/maps/dir/' + iceAge.secondaryPosition.latitude + '+' + iceAge.secondaryPosition.longitude + '/' + eastLat + 'N+' + eastLong + 'W">Secondary Directions to East End</a>';
                                segmentHTML += '<div class="getSecondaryDistance" data-lat="' + eastLat + '" data-long="' + eastLong + '"></div>';
                                segmentHTML += '</div>';
                            }
                            segmentHTML += '</div>';
                        }
                        
                    }

                    segmentHTML += '</div>';
                }
            }

            segmentHTML += '</div>';

            segmentHTML += '<div class="user_badge_container">';

            for (var u = 0; u < usersCompleteArray.length; u++) {
                //segmentHTML += '<div class="badge" data-complete="' + usersCompleteArray[u] + '">';
                //segmentHTML += '<img src="./images/' + usersCompleteArray[u] + '-complete.svg" alt="" /><span class="badge_label">' + usersCompleteArray[u] + '</span></div>';

                segmentHTML += '<div class="badge" data-complete="' + usersCompleteArray[u] + '">';

                segmentHTML += '<svg version="1.1" id="Layer_1" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" x="0px" y="0px" viewBox="0 0 293.938 301.906" enable-background="new 0 0 293.938 301.906" xml:space="preserve">';
                segmentHTML += '<polygon class="fill" fill="#062335" points="185.238,107.453 152.818,107.453 152.818,117.953 141.119,117.953 141.119,107.453 108.699,107.453	117.989,94.243 114.209,94.243 121.309,84.143 113.969,84.143 121.049,74.073 116.149,74.073 125.419,60.883 119.659,60.883	146.969,22.043 174.278,60.883 168.519,60.883 177.789,74.073 172.889,74.073 179.969,84.143 172.629,84.143 179.729,94.243	175.949,94.243 "/>';
                segmentHTML += '<path class="stroke" fill="none" stroke="#790301" stroke-width="4" stroke-miterlimit="10" d="M146.889,169.438"/>';
                segmentHTML += '<path class="stroke" fill="none" stroke="#082C46" stroke-width="4" stroke-miterlimit="10" d="M270.68,169.438 c0,62.976-55.424,114.025-123.791,114.025c-68.368,0-123.791-51.051-123.791-114.025"/>';
                segmentHTML += '<path class="stroke fill" fill="#082C46" stroke="#082C46" stroke-width="8" stroke-miterlimit="10" d="M146.969,154.938c-78.959,0-142.969,0-142.969,0	c0,78.959,64.009,142.97,142.969,142.97c78.959,0,142.969-64.011,142.969-142.97C289.938,154.938,225.928,154.938,146.969,154.938z M146.969,294.771C70.218,294.771,8,233.568,8,158.073c0,0,62.218,0,138.969,0c76.75,0,138.969,0,138.969,0 C285.938,233.568,223.719,294.771,146.969,294.771z"/>';
                segmentHTML += '<path class="fill" fill="#082C46" d="M286.129,184.934h-136.16l41.4,104.119c-23.98,6.67-44.4,5.73-44.4,5.73h-0.08c0,0-20.42,0.939-44.41-5.73 l41.41-104.119H11.969v-67.96h85.99v-4.6h-25.03l7.17-11.42h-2.92l5.48-8.72h-5.66l5.46-8.71h-3.78l7.16-11.4h-4.45l21.09-33.58 l21.09,33.58h-4.45l7.16,11.4h-3.78l5.46,8.71h-5.66l5.48,8.72h-2.92l7.17,11.42h-25.03v4.6h85.96v-7.94h-25.03l7.17-10.59h-2.92 l5.48-8.1h-5.66l5.46-8.07h-3.78l7.16-10.58h-4.45l21.09-31.15l21.09,31.15h-4.449l7.159,10.58h-3.779l5.46,8.07h-5.66l5.479,8.1 h-2.92l7.17,10.59h-25.029v7.94h84.13V184.934z"/>';
                segmentHTML += '<path class="stroke" fill="none" stroke="#082C46" stroke-width="4" stroke-miterlimit="10" d="M270.68,132.469 c0-62.975-55.424-114.025-123.791-114.025c-68.368,0-123.791,51.051-123.791,114.025"/>';
                segmentHTML += '<path class="stroke fill" fill="#082C46" stroke="#082C46" stroke-width="8" stroke-miterlimit="10" d="M289.938,146.969 C289.938,68.01,225.928,4,146.969,4C68.009,4,4,68.01,4,146.969c0,0,64.009,0,142.969,0 C225.928,146.969,289.938,146.969,289.938,146.969z M285.938,143.833c0,0-62.219,0-138.969,0S8,143.833,8,143.833 C8,68.338,70.218,7.136,146.969,7.136C223.719,7.136,285.938,68.338,285.938,143.833z"/>';
                segmentHTML += '</svg>';
                segmentHTML += '<span class="badge_label">' + usersCompleteArray[u] + '</span>';
                segmentHTML += '</div>';
            }
            for (var up = 0; up < usersPartialArray.length; up++) {
                //segmentHTML += '<div class="badge" data-partial="' + usersPartialArray[up] + '"><img src="./images/' + usersPartialArray[up] + '-partial.svg" alt="" /><span class="badge_label">' + usersPartialArray[up] + '</span></div>';
                
                segmentHTML += '<div class="badge" data-partial="' + usersPartialArray[up] + '">';
                    segmentHTML += '<svg version="1.1" id="Layer_1" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" x="0px" y="0px" viewBox="0 0 293.938 301.906" enable-background="new 0 0 293.938 301.906" xml:space="preserve">';
                    segmentHTML += '<path class="stroke" fill="none" stroke="#790301" stroke-width="4" stroke-miterlimit="10" d="M146.889,169.438"/>';
                    segmentHTML += '<path class="stroke" fill="none" stroke="#082C46" stroke-width="4" stroke-miterlimit="10" d="M23.099,169.434c0,5.26,0.39,10.43,1.13,15.5 c6.39,43.279,39.14,78.85,82.87,92.51"/>';
                    segmentHTML += '<path class="stroke" fill="none" stroke="#082C46" stroke-width="4" stroke-miterlimit="10" d="M186.749,277.423 c43.7-13.68,76.41-49.229,82.8-92.489c0.74-5.07,1.13-10.24,1.13-15.5"/>';
                    segmentHTML += '<path class="stroke fill" fill="#082C46" stroke="#082C46" stroke-width="8" stroke-miterlimit="10" d="M146.969,154.938c-78.959,0-142.969,0-142.969,0	c0,78.959,64.009,142.97,142.969,142.97c78.959,0,142.969-64.011,142.969-142.97C289.938,154.938,225.928,154.938,146.969,154.938z M146.969,294.771C70.218,294.771,8,233.568,8,158.073c0,0,62.218,0,138.969,0c76.75,0,138.969,0,138.969,0 C285.938,233.568,223.719,294.771,146.969,294.771z"/>';
                    segmentHTML += '<path class="fill" fill="#082C46" d="M286.129,150.953v33.98h-136.16l36.78,92.489l4.62,11.63c-23.98,6.67-44.4,5.73-44.4,5.73h-0.08 c0,0-20.42,0.939-44.41-5.73l4.62-11.609l36.79-92.51H11.969v-33.98H286.129z"/></svg>';
                    segmentHTML += '<span class="badge_label">' + usersPartialArray[up] + '</span>';
                segmentHTML += '</div>';
            }

            segmentHTML += '</div>';

            if (ice_age_data[i].nohiking.trim() !== '') {
                segmentHTML += '<div class="nohiking">Hiking Restrictions: </div><div>' + ice_age_data[i].nohiking + '</div>';
            }

            segmentHTML += '</div>';
            segmentHTML += '</div>';

            if (typeof ice_age_data[i + 1] != 'undefined') {
                nextSection = ice_age_data[i + 1].booksection;
            } else {
                nextSection = '';
            }

            if (ice_age_data[i].booksection != nextSection) {
                segmentHTML += '</div>'; //END COUNTY DIV

                if (allComplete) {
                    countyCompleteArray.push(countyCounter - 1);
                }
            }

            previousSection = ice_age_data[i].booksection;
            usersCompleteArray = [];
        }

        selectHTML += '</select>';

        $('#segment_list').html(segmentHTML);
        $('#segment_filter ul').html(filterHTML);
        $('#segment_filter_container').append(selectHTML);
        
        for (var cc = 0; cc < countyCompleteArray.length; cc++) {
            $('#segment_filter li a[data-index="' + countyCompleteArray[cc] + '"]').parent('li').addClass('complete');
            $('#segment_list .county[data-index="' + countyCompleteArray[cc] + '"]').addClass('complete');
        }

        iceAge.displayUserProgress();
    },

    displayInfoWithIcon: function(stringValue, value) {
        var readableType = stringValue,
            className = stringValue.toLowerCase(),
            html = '';

        if (stringValue == 'potablewater') {
            readableType = 'potable water';
        }
        if (value.trim() !== '') {
            html += '<div data-icon="' + className + '" class="segment_details">';
            html += '<span class="yes">' + readableType + ':</span>';
            html += '</div>';
        } else {
            html += '<div data-icon="' + className + '" class="segment_details">';
            html += '<span class="no">' + readableType + ':</span>';
            html += '</div>';
        }

        return html;
    },

    getDistanceFromCurrentLocation: function(htmlElement, currentPosLat, currentPosLong, destLat, destLong, secondary) {

        var origin = new google.maps.LatLng(currentPosLat, currentPosLong);
        var destination = new google.maps.LatLng(destLat, -(destLong));
        var service = new google.maps.DistanceMatrixService();
        service.getDistanceMatrix({
            origins: [origin],
            destinations: [destination],
            unitSystem: google.maps.UnitSystem.IMPERIAL,
            travelMode: google.maps.DirectionsTravelMode.DRIVING
        }, function(response, status) {
            if (status == 'OK') {
                var origins = response.originAddresses;
                var destinations = response.destinationAddresses;

                for (var i = 0; i < origins.length; i++) {
                    var results = response.rows[i].elements;

                    for (var j = 0; j < results.length; j++) {
                        var element = results[j];
                        var distance = element.distance.text;
                        var duration = element.duration.text;
                        var from = origins[i];
                        var to = destinations[j];

                        if(!secondary){
                            $(htmlElement).html("<div>Drive Distance: " + distance + "</div><div>Drive Time: " + duration + "</div>");      
                        }
                        else{
                            $(htmlElement).html("<div>Other Drive Distance: " + distance + "</div><div>Other Drive Time: " + duration + "</div>");
                        }
                        
                    }
                }
            }
        });
    },

    convertCoord: function(coord) {
        var decimalCoord;
        var degree = 0,
            min = 0,
            sec = 0;
        if (coord !== '') {
            coord = coord.split(' ');
            degree = parseFloat(coord[0]);
            min = parseFloat(coord[1]);

            decimalCoord = degree + (min / 60);

            return decimalCoord;
        }
    },

    getDifficultyLevel: function(iceAgeDistance, shortCutoff, midCutoff) {
        var difficulty = '';
        if (iceAgeDistance <= shortCutoff) {
            difficulty = 'easy';
        } else if (iceAgeDistance <= midCutoff) {
            difficulty = 'average';
        } else {
            difficulty = 'difficult';
        }
        return difficulty;
    },

    usersWhoHaveCompletedSegment: function(segmentId) {
        var userArray = [];

        for (var i = 0; i < progress_data.users.length; i++) {
            for (var k = 0; k < progress_data.users[i].completedSegments.length; k++) {
                var id = progress_data.users[i].completedSegments[k].segmentId;
                if (id == segmentId) {
                    userArray.push(progress_data.users[i].user);
                    break;
                }
            }
        }
        return userArray;
    },

    usersWhoHavePartialSegment: function(segmentId) {
        var userArray = [];

        for (var i = 0; i < progress_data.users.length; i++) {
            for (var l = 0; l < progress_data.users[i].partialSegments.length; l++) {
                var id = progress_data.users[i].partialSegments[l].segmentId;
                if (id == segmentId) {
                    userArray.push(progress_data.users[i].user);
                    break;
                }
            }
        }
        return userArray;
    },

    /*
    ******************
    Display User Progress
    ******************
    */
    displayUserProgress: function() {
        var userName = '',
            userHTML = '',
            userCompleteList = '',
            userPartialList = '',
            userCompleteMiles = 0,
            userPartialMiles = 0,
            userCompleteSegments = 0;

        for (var i = 0; i < progress_data.users.length; i++) {
            userCompleteList = '';
            userPartialList = '';
            userCompleteMiles = 0;
            userPartialMiles = 0;
            userCompleteSegments = 0;

            userName = progress_data.users[i].user;
            userHTML += '<div class="user_container">';
            userHTML += '<h2>Hiker ' + progress_data.users[i].user + '</h2>';
            for (var j = 0; j < ice_age_data.length; j++) {

                for (var k = 0; k < progress_data.users[i].completedSegments.length; k++) {
                    var id = progress_data.users[i].completedSegments[k].segmentId;
                    if (id == ice_age_data[j].segment_id) {
                        userCompleteList += '<div class="segment_name">' + ice_age_data[j].segment + ' <span class="completion_data">( ' + progress_data.users[i].completedSegments[k].dateOfCompletion + ' )</span></div>';
                        userCompleteMiles += parseFloat(ice_age_data[j].iceagetraildistance);
                        userCompleteSegments++;

                        break;
                    }
                }

                for (var l = 0; l < progress_data.users[i].partialSegments.length; l++) {
                    var id = progress_data.users[i].partialSegments[l].segmentId;
                    if (id == ice_age_data[j].segment_id) {
                        userPartialList += '<div class="user_segment_container">';
                        userPartialList += '<div class="segment_name">' + ice_age_data[j].segment + '</div>';
                        userPartialList += '<div class="seg_notes">' + progress_data.users[i].partialSegments[l].notes + '</div>';
                        userPartialList += '</div>';
                        userPartialMiles += parseFloat(ice_age_data[j].iceagetraildistance);

                        break;
                    }
                }

            } //END ICE AGE DATA LOOP

            userHTML += '<div class="user_segments">';
            userHTML += '<div>Distance of partially completed segments: ' + parseFloat(userPartialMiles.toFixed(2)) + ' miles</div>';


            userHTML += '<div>' + parseFloat(userCompleteMiles.toFixed(2)) + ' of ' + iceAge.totalTrailDistance + ' miles completed</div>';
            userHTML += '<div>' + (iceAge.totalSegments - userCompleteSegments) + ' segments remaining</div>';

            userHTML += '<div class="user_miles_remaining">' + (parseFloat(iceAge.totalTrailDistance) - parseFloat(userCompleteMiles.toFixed(2))) + ' miles remaining</div>';
            userHTML += '</div>';



            userHTML += '<div class="user_segments">';
            userHTML += '<h3 class="user_header">Completed Segments ( ' + progress_data.users[i].completedSegments.length + ' )</h3>';
            userHTML += userCompleteList;
            userHTML += '</div>';

            if (userPartialMiles > 0) {
                userHTML += '<div class="user_segments">';
                userHTML += '<h3 class="user_header">Partially Completed Segments ( ' + progress_data.users[i].partialSegments.length + ' )</h3>';
                userHTML += userPartialList;
                userHTML += '</div>';
            }
            /*
                        userHTML += '<div class="user_segments">';
                        userHTML += '<h3 class="user_header">Distance:</h3>';
                        userHTML += '<div>Distance of partially completed segments: ' + userPartialMiles + ' miles</div>';
                        userHTML += '<div>' + parseFloat(userCompleteMiles.toFixed(2)) + ' of ' + iceAge.totalTrailDistance + ' miles completed</div>';
                        userHTML += '<div>' + (iceAge.totalSegments - userCompleteSegments) + ' segments remaining</div>';

                        userHTML += '<div class="user_miles_remaining">' + (parseFloat(iceAge.totalTrailDistance) - parseFloat(userCompleteMiles.toFixed(2))) + ' miles remaining!</div>';
                        userHTML += '</div>';
            */
            userHTML += '</div>';
        } //END USER LOOP

        $('#progress_view').html(userHTML);
    },
    /*
    ******************
    Attach Event Listeners
    ******************
    */
    attachEventListeners: function() {
        $('#segment_list').on('click', '[data-icon="restrooms"] .yes', function() {
            var segmentIndex = $(this).closest('.segment').attr('data-index');
            // alert(ice_age_data[segmentIndex - 1].restrooms);
            var heading = '<h4 class="overlay_heading">' + ice_age_data[segmentIndex - 1].segment + ' ' + $(this).text() + '</h4>';
            iceAge.openOverlay(heading + ice_age_data[segmentIndex - 1].restrooms);
        });

        $('#segment_list').on('click', '[data-icon="potablewater"] .yes', function() {
            var segmentIndex = $(this).closest('.segment').attr('data-index');
            //alert(ice_age_data[segmentIndex - 1].potablewater);
            var heading = '<h4 class="overlay_heading">' + ice_age_data[segmentIndex - 1].segment + ' ' + $(this).text() + '</h4>';
            iceAge.openOverlay(heading + ice_age_data[segmentIndex - 1].potablewater); 
        });

        //CHANGE SEGMENT ON CLICK
        $('#segment_filter').on('click', 'a', function(e) {
            e.preventDefault();

            var segment = $(this).attr('href');

            $('#segment_filter li').removeClass('selected');
            $(this).parent('li').addClass('selected');

            $('.county').hide();
            $('.county[data-index="' + segment + '"]').show();

            if (!$('.county[data-index="' + segment + '"]').attr('data-loaded')) {
                $('.county[data-index="' + segment + '"]').find(".getDistance").each(function() {
                    iceAge.getDistanceFromCurrentLocation($(this), iceAge.position.coords.latitude, iceAge.position.coords.longitude, $(this).attr('data-lat'), $(this).attr('data-long'), false);
                });
                $('.county[data-index="' + segment + '"]').find(".getSecondaryDistance").each(function() {
                    iceAge.getDistanceFromCurrentLocation($(this), iceAge.secondaryPosition.latitude, iceAge.secondaryPosition.longitude, $(this).attr('data-lat'), $(this).attr('data-long'), true);
                });

            }

            $('.county[data-index="' + segment + '"]').attr('data-loaded', 'true');

            //$('#segment_filter_container select option[value="' + segment + '"]')

            $('html, body').animate({
                scrollTop: 0
            });
        });

        //CHANGE SEGMENT SELECT BOX;
        $('body').on('change', '#segment_filter_container select', function() {
            var segment = $(this).val();

            $('.county').hide();
            $('[data-index="' + segment + '"]').show();

            $('#segment_filter li').removeClass('selected');
            $('#segment_filter li a[data-index="' + segment + '"]').parent('li').addClass('selected');

            if (!$('.county[data-index="' + segment + '"]').attr('data-loaded')) {
                $('.county[data-index="' + segment + '"]').find(".getDistance").each(function() {
                    iceAge.getDistanceFromCurrentLocation($(this), iceAge.position.coords.latitude, iceAge.position.coords.longitude, $(this).attr('data-lat'), $(this).attr('data-long'), false);
                });
                $('.county[data-index="' + segment + '"]').find(".getSecondaryDistance").each(function() {
                    iceAge.getDistanceFromCurrentLocation($(this), iceAge.secondaryPosition.latitude, iceAge.secondaryPosition.longitude, $(this).attr('data-lat'), $(this).attr('data-long'), true);
                });
            }

            $('.county[data-index="' + segment + '"]').attr('data-loaded', 'true');
        });

        $('nav').on('click', '.nav_item', function(e) {
            $('.view').hide();
            $('.nav_item').removeClass('selected');

            $(this).addClass('selected');
            $('#' + $(this).attr('id') + '_view').show();

        });

        //ARROW THROUGH COUNTIES ON SEGMENT VIEW
        $('body').on('keyup', function(e) {
            var nextElement = null;
            if (e.keyCode == 39) {
                nextElement = $('#segment_filter li.selected');

                if ($(nextElement).next().length > 0) {
                    $('#segment_filter li').removeClass('selected');
                    $(nextElement).next().addClass('selected');
                    $('#segment_filter li.selected a').click();
                }

            } else if (e.keyCode == 37) {
                nextElement = $('#segment_filter li.selected');

                if ($(nextElement).prev().length > 0) {
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
    openOverlay: function(overlayHTML){
        var $overlay = $('#ice_age_overlay');

        $('body').prepend('<div id="overlay_screen"></div>');
        $overlay.html(overlayHTML);
        
        var overlayHeight = $overlay.height();

        $('#overlay_screen').height($(window).height())
        $overlay.css("top", $(window).height() / 2 - overlayHeight / 2);
        $overlay.show();

        $('#overlay_screen').one('click', iceAge.closeOverlay);
    },
    closeOverlay: function(){
        $('#overlay_screen').remove();
        $('#ice_age_overlay').hide();
    }
};