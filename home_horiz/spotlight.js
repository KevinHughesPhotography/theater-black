define(['visibleinviewport', 'itemShortcuts', 'browser'], function (visibleinviewport, itemShortcuts, browser) {
    'use strict';

    function loadItemIntoSpotlight(card, item, width) {

        if (!item.BackdropImageTags || !item.BackdropImageTags.length) {
            return;
        }

        if (document.activeElement === card) {
            card.dispatchEvent(new CustomEvent("focus"));
        }

        var imgUrl = Emby.Models.backdropImageUrl(item, {
            maxWidth: width
        });

        var cardImageContainer = card.querySelector('.cardImage');

        var newCardImageContainer = document.createElement('div');
        newCardImageContainer.className = cardImageContainer.className;

        newCardImageContainer.style.backgroundImage = "linear-gradient(to bottom, rgba(0,0,0,0) 0%,rgba(0,0,0,0) 28%,rgba(0,0,0,0) 39%,rgba(0,0,0,0.43) 91%,rgba(0,0,0,0.9) 100%), url('" + imgUrl + "')";
                
       //if (!newCardImageContainer.classList.contains(".wideSpotlightCard:before")){
           //newCardImageContainer.classList.add('.wideSpotlightCard:before');
        //}   
        //newCardImageContainer.addClass('.wideSpotlightCard:before');
        
       
               
        
        //document.styleSheets[0].addRule(
            //'.wideSpotlight:before', 'background-image: -moz-linear-gradient(top, rgba(0,0,0,0) 0%, rgba(0,0,0,0) 28%, rgba(0,0,0,0) 39%, rgba(0,0,0,0.43) 91%, rgba(0,0,0,0.43) 100%); background-image: linear-gradient(to bottom, rgba(0,0,0,0) 0%,rgba(0,0,0,0) 28%,rgba(0,0,0,0) 39%,rgba(0,0,0,0.43) 91%,rgba(0,0,0,0.43) 100%); background-image: -webkit-linear-gradient(top, rgba(0,0,0,0) 0%,rgba(0,0,0,0) 28%,rgba(0,0,0,0) 39%,rgba(0,0,0,0.43) 91%,rgba(0,0,0,0.43) 100%);');
        //newCardImageContainer.style.

         //background: -moz-linear-gradient(top, rgba(0,0,0,0) 0%, rgba(0,0,0,0) 28%, rgba(0,0,0,0) 39%, rgba(0,0,0,0.43) 91%, rgba(0,0,0,0.43) 100%); /* FF3.6-15 */
         //background: -webkit-linear-gradient(top, rgba(0,0,0,0) 0%,rgba(0,0,0,0) 28%,rgba(0,0,0,0) 39%,rgba(0,0,0,0.43) 91%,rgba(0,0,0,0.43) 100%); /* Chrome10-25,Safari5.1-6 */
         //background: linear-gradient(to bottom, rgba(0,0,0,0) 0%,rgba(0,0,0,0) 28%,rgba(0,0,0,0) 39%,rgba(0,0,0,0.43) 91%,rgba(0,0,0,0.43) 100%); 
        
        
        
        
        card.querySelector('.cardText').innerHTML = item.Name;
        card.querySelector('.cardText').style.opacity = "0 !important";
        card.querySelector('.cardText').style.animationName = "fadein";
        
        //card.classList.add('.wideSpotlightCard:before');
        card.setAttribute('data-id', item.Id);
        card.setAttribute('data-serverid', item.ServerId);
        card.setAttribute('data-type', item.Type);
        card.setAttribute('data-isfolder', item.IsFolder.toString());
        card.setAttribute('data-action', 'link');
        card.classList.add('itemAction');

        cardImageContainer.parentNode.appendChild(newCardImageContainer);

        var onAnimationFinished = function () {

            var parentNode = cardImageContainer.parentNode;
            if (parentNode) {
                parentNode.removeChild(cardImageContainer);
            }
        };

        // Only use the fade animation if native support for WebAnimations is present
        if (browser.animate /*&& cardImageContainer.style.backgroundImage*/) {
            var keyframes = [
                { 
                 opacity: '0',
                 transform: 'scale(1, 0.8)',
                 filter: 'blur(90px)'
                },
                {
                opacity: '1',
                transform: 'scale(1, 1)',
                filter: 'blur(0px)'
                }];
            var timing = { duration: 1000, iterations: 1 };
            newCardImageContainer.animate(keyframes, timing).onfinish = onAnimationFinished;
        } else {
            onAnimationFinished();
        }
    }

  
    
    
    function spotlight(card, items, width) {

        var self = this;

        itemShortcuts.on(card);

        self.items = items;
        self.card = card;
        self.width = width;

        self.start();
    }

    spotlight.prototype.start = function() {

        var self = this;
        var items = self.items;
        var card = self.card;
        var width = self.width;

        if (!items.length) {
            return;
        }

        loadItemIntoSpotlight(card, items[0], width);

        if (items.length === 1) {
            return;
        }

        if (browser.slow) {
            return;
        }

        self.index = 1;
        // Use a higher interval for browsers that don't perform as well
        var intervalMs = browser.animate ? 10000 : 30000;

        self.interval = setInterval(self.onInterval.bind(self), intervalMs);
    };

    spotlight.prototype.onInterval = function () {

        var self = this;
        var items = self.items;
        var card = self.card;
        var width = self.width;

        if (!document.body.contains(card)) {
            clearInterval(self.interval);
            return;
        }

        if (!visibleinviewport(card, false, 0)) {
            // If it's not visible on screen, skip it
            return;
        }

        if (self.index >= items.length) {
            self.index = 0;
        }

        loadItemIntoSpotlight(card, items[self.index], width);
        self.index++;
    };

    spotlight.prototype.destroy = function () {

        var self = this;

        itemShortcuts.off(self.card);

        if (self.interval) {
            clearInterval(self.interval);
        }

        self.interval = null;
        self.items = null;
        self.card = null;
    };

    return spotlight;
});
