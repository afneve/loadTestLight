
    createTrelloCards: function() {
        if (iceAge.trelloCounter < ice_age_data.length) {
            var segment = ice_age_data[iceAge.trelloCounter].segment;
            var id = ice_age_data[iceAge.trelloCounter].segment_id;

            Trello.post("cards?name=" + segment + "&idList=" + iceAge.unfinishedListId + "&desc=ID: " + id + " |", function(d) {
                iceAge.trelloCounter++;
                iceAge.createTrelloCards();
            });
        }
    },
    debug: function() {
        $("#title").text("Debugging");

        Trello.get("boards/" + iceAge.boardId + "/lists/", function(d) {
            console.log("LIST ID | LIST NAME")
            for (s in d) {
                console.log(d[s].id + " | " + d[s].name);
            }

            Trello.get("lists/" + iceAge.unfinishedListId + "/cards", function(d) {
                //Get cards in completed lists	
                console.log(d);

            });
        });
    },