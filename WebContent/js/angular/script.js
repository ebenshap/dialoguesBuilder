//global variables
var idCount = 1;
var idActorCount = 1;

var myApp = angular.module('DAOModule', ['ngRoute'])
window.dragScrollOn = 0;
myApp.factory('dao', function() {
  dao = ChatBuilderDAO.init(1);
  //dao.clearData();
  return dao;
});

myApp.config(['$routeProvider', function($routeProvider) {
  $routeProvider.when('/export', { templateUrl: 'tpl/export.html', controller: 'ExportController' });
  $routeProvider.when('/exportFinal', { templateUrl: 'tpl/export.html', controller: 'ExportFinalController' });
  $routeProvider.when('/import', { templateUrl: 'tpl/import.html', controller: 'ImportController' });
  $routeProvider.when('/documentation', { templateUrl: 'tpl/documentation.html', controller: 'DocumentationController' });
  $routeProvider.when('/contact', { templateUrl: 'tpl/contact.html', controller: 'ContactController' });

  $routeProvider.otherwise({redirectTo:'/builder'});
}]);

myApp.controller('BuilderController', function($scope, dao, $location) {
    
  $scope.$on('$locationChangeStart', function(event, newUrl, oldUrl) {
    if( newUrl.match(/builder$/ ) ){
      $('#builder').css('display', 'block');
    }else{
      $('#builder').css('display', 'none');
    }
  });  
  
  $(window).on('load', function(){
    $.getScript('js/dragscroll.js');
  });
  
  
  SCOPE = $scope;
  var curForm;
 
  function viewPortContainsPoint(p) {
    p = g.point(p);
    if (p.x >= 0 && p.x <= paper.$el.find('svg').width() &&
      p.y >= 0 && p.y <= paper.$el.find('svg').height() ) {
      return true;
    }
    return false;
  }

  function createBox(text, inPorts, outPorts, color, position, textmarkup, id){
    position = position || { x: 50+ paper.$el.scrollLeft(), y: 50+paper.$el.scrollTop() }
          
    var portMarkup='<g class="rotatable">\
      <g class="scalable">\
      <rect class="body"/>\
      </g>\
      <g class="inPorts"/>\
      <g class="outPorts"/>\
      </g>';


    var m1 = new joint.shapes.devs.DialogueBox({
      chatId:id,
      //markup:markup,
      position: position,
      size: { width: 90, height: 90 },
      inPorts: inPorts,
      outPorts: outPorts,
      attrs: {
        '.label': { text: text, 'ref-x': .4, 'ref-y': .2 },
        'p':{text:'sdfdf'},
        rect: { fill: '#'+color },
        '.inPorts circle': { fill: '#16A085' },
        '.outPorts circle': { fill: '#E74C3C' }, 
        '.body': {
          // width: 90, height: 90,
        }
      }
    }).on('change:position', function(cell) {
    //console.log(element.id, ':', element.get('position'));
  
    var cellBbox = cell.getBBox();
                        
    var moveY = paper.el.scrollTop;
    var moveX = paper.el.scrollLeft;
                         
    if ( !viewPortContainsPoint(cellBbox.origin()) ){
                      
      // All the four corners of the child are inside
      // the parent area.
      // Revert the child position.
      cell.set('position', cell.previous('position'));
        return;
      }else if(  !viewPortContainsPoint(cellBbox.corner()) ){
                           
        if( !viewPortContainsPoint(cellBbox.topRight()) ){
          paper.$el.find('svg').width(cellBbox.corner().x)
          moveX = cellBbox.corner().x-2;
        }
               
        if( !viewPortContainsPoint(cellBbox.bottomLeft()) ){
          paper.$el.find('svg').height(cellBbox.corner().y)
          moveY = cellBbox.corner().y-2;
        }
       // if(!moveX) moveX = paper.el.scrollLeft;
        //if(!moveY) moveY = paper.el.scrollTop;
        
        //paper.el.scrollTo(moveX, moveY)
        paper.$el.scrollTop(moveY)
        paper.$el.scrollLeft(moveX)
        
        
      }else{
        //whether to scroll or not
        var scrollLeft = paper.$el.scrollLeft();
        var scrollTop = paper.$el.scrollTop();
        var cBox = cellBbox.origin()
        var bottomCorner = cellBbox.corner();
        var topCorner = cellBbox.topRight();
        var doUpdate = 0;
        if(cBox.x<=scrollLeft){
          moveX = cBox.x;
          doUpdate++;
        }
        //console.log(bottomCorner.x)
        //console.log(scrollLeft + paper.$el.width())
        else if(bottomCorner.x >scrollLeft + paper.$el.width()){
        moveX = bottomCorner.x - paper.$el.width();
        doUpdate++;
      }
         
      else if(cBox.y<=scrollTop){
        moveY = cBox.y;
        doUpdate++;
      }
          
      else if( bottomCorner.y >= scrollTop + paper.$el.height()){
        moveY = bottomCorner.y - paper.$el.height();
        doUpdate++;
      }
          
      if(doUpdate){
        //paper.el.scrollTo(moveX, moveY);
       //  if(!moveX) moveX = paper.el.scrollLeft;
       // if(!moveY) moveY = paper.el.scrollTop;
        paper.$el.scrollTop(moveY)
        paper.$el.scrollLeft(moveX)
      }
    }
  })

   var toolMarkup= [
     '<g class="link-tool">',
     '<g class="tool-remove" event="remove" style="z-index=999999">',
     '<circle transform="translate(-8, -8)" style="fill:black;" r="11" />',
     '<path transform="scale(.8) translate(-26, -26)" d="M24.778,21.419 19.276,15.917 24.777,10.415 21.949,7.585 16.447,13.087 10.945,7.585 8.117,10.415 13.618,15.917 8.116,21.419 10.946,24.248 16.447,18.746 21.948,24.248z"/>',
     '<title>Remove link.</title>',
     '</g>',
     '</g>'
   ].join('');
               
   m1.markup = portMarkup + m1.markup+toolMarkup;
   m1.setDivContent(m1, textmarkup)
   graph.addCell(m1);

   m1.attr('foreignObject p.label',{
     text:text
   })  
                
   var m1View = m1.findView(paper)
   m1View.$el.find('.tool-remove').click(function(){
     $scope.removeDialogue(m1.get('chatId'));
     if(curForm && m1===curForm.model){
       curForm = null;
     }
     m1.remove();
     
   })
   return m1;
 }
 
 $scope.resizeBox = function(obj){
 
    var foreignObject = obj.findView(paper).$el.find('foreignObject');
    
   var originalHeight = foreignObject.height() || 90;
   var originalWidth = foreignObject.find('div').width();
    
    foreignObject.find('div').attr('style', '');
    var body = foreignObject.find('body');
    var bodyHeight = body.height();
    var bodyWidth = 300;
    obj.resize(bodyWidth, bodyHeight);
    foreignObject.find('div').width(bodyWidth);
    foreignObject.height(bodyHeight);
    var position = obj.position();
    var x = position.x;
    var y = position.y;
    
    //measure change in size
    var margin = 10; 
    var newHeight= bodyHeight - originalHeight;
    var newWidth= bodyWidth - originalWidth;
    if(newHeight == margin) newHeight = 0;
    if(newWidth == margin) newWidth = 0;
    
    var allElements = graph.getElements();
    _.each(allElements, function( item, index, array){
      if(item !=obj){
        var itemPosition = item.position();
        if(itemPosition.x > x && itemPosition.y > y){
          item.position(itemPosition.x+newWidth, itemPosition.y+newHeight);
        }
      }
    });
    
 }

 $scope.actors = [];
 
  $scope.addActor = function() {		
    dao.inserOrUpdateActor({
      id:parseInt(this.actor.id), 
      name:this.actor.name
    });	
    update();
  };
	
  $scope.editActor = function( id ) {
    $scope.actor =  dao.getActor(id);
  };
	
  $scope.removeActor = function( id ) {
    dao.removeActor(id);	
    update();
  };

 $scope.addDialogue = function(){
  var id = idCount++;
  
  createBox('Dialogue',[''] ,[''], '3300CC', null, createBoxHtml({id:id}, 'dialogue') , id );
  
  dao.insertOrUpdateDialog({
    id: id,
    parent: '',
    isChoice: false,
    actor: '',
    conversant: '',
    menuText: "",
    dialogueText: "",
    conditionsString: "",
    codeBefore: "",
    codeAfter: "",
    outgoingLinks: '',
    outgoingLinkLinks:''
  });
  
 }

 $scope.addChoice = function(){
  var id = idCount++;
  
  createBox('Choice',[''] ,[ ''], '2ECC71', null, createBoxHtml({id:id}, 'choice'), id );
  
  dao.insertOrUpdateDialog({
    id: id,
    parent: '',
    isChoice: true,
    conditionsString: "",
    codeBefore: "",
    codeAfter: "",
    outgoingLinks: '',
    outgoingLinkLinks: ''
  });
 }

 //--DIALOGS--------------------------
 $scope.dialogues = false;

 $scope.removeDialogue = function( id ) {
  dao.removeDialogue(id);
 };

  $scope.updateDialogue = function() {
  
    if(!curForm){
      return;
    }
    
    var chatId = curForm.model.get('chatId');
    console.log()
    dao.insertOrUpdateDialog({
      id: chatId,
      //parent: parseInt(this.dialogue.parent),
      isChoice: false,
      actor: parseInt(this.dialogue.actor),
      conversant: parseInt(this.dialogue.conversant),			
      menuText: this.dialogue.menuText || "",
      dialogueText: this.dialogue.dialogueText || "",
      conditionsString: this.dialogue.conditionsString || "",
      codeBefore: this.dialogue.codeBefore || "",
      codeAfter: this.dialogue.codeAfter || "",
      outgoingLinks: dao.utils.parseOutgoingLinks( this.dialogue.outgoingLinks),
      //outgoingLinkLinks: ''			
    });	

    curForm.model.attr({
      '.id':{ text:'id: '+chatId, fill:'black'},
      '.actor':{ text: dao.getActor(parseInt(this.dialogue.actor)).name, fill:'black'},
      '.conversant':{ text:dao.getActor(parseInt(this.dialogue.conversant)).name, fill:'black'},
      '.menuText':{ text: labelString( $scope.dialogue.menuText, 'Menu Title') , fill:'black'},
      '.dialogueText':{ text: $scope.dialogue.dialogueText  , fill:'black'},
      '.before':{ text: labelString( $scope.dialogue.codeBefore, 'B') , fill:'black'},
      '.after':{ text: labelString( $scope.dialogue.codeAfter, 'A') , fill:'black'},
      '.conditional':{ text: labelString( $scope.dialogue.conditionsString, 'C'), fill:'black'},
      '.outgoingLinks':{ text: labelString( $scope.dialogue.outgoingLinks, 'O'), fill:'black'}
    });
    $scope.resizeBox(curForm.model);
    
    
    
 };

 //--CHOISES--------------------------------------------
 $scope.choices = false;

 $scope.removeChoice = function( id ) {
  
 };

 function labelString(string, label){
   if(!string){
     return '';
   }
   return label+': '+string;
 }

 $scope.updateChoice = function() {
    
    if(!curForm){
      return;
    }
    
    var chatId = curForm.model.get('chatId');
    
    curForm.model.attr({
    '.id':{ text:'id: '+chatId, fill:'black'},
    '.before':{ text: labelString( $scope.choice.codeBefore, 'B' ), fill:'black'},
    '.after':{ text: labelString( $scope.choice.codeAfter, 'A' ), fill:'black'},
    '.conditional':{ text: labelString( $scope.choice.conditionsString, 'C' ), fill:'black'}
    });
    
    dao.insertOrUpdateDialog({
      id: parseInt(chatId),
      //parent: null,
      isChoice: true,					
      conditionsString: $scope.choice.conditionsString || "",
      codeBefore: $scope.choice.codeBefore || "",
      codeAfter: $scope.choice.codeAfter || "",
      outgoingLinks: dao.utils.parseOutgoingLinks( this.choice.outgoingLinks)
    });	
    
  $scope.resizeBox(curForm.model);
 };

 //--DIAGRAM--------------------------------

 function link(source, target, breakpoints) {

  var cell = new joint.shapes.org.Arrow({
   source: { id: source.id },
   target: { id: target.id },
   vertices: breakpoints
  });
  graph.addCell(cell);
  return cell;
 }
 
 //http://stackoverflow.com/questions/21342596/tree-structure-from-adjacency-list
  function getAdjacencyListChildren(){
    
    var allData = dao.getData();
    var flat = allData.dialogues;
    if(!flat) return false;
    
    var nodes = [];
    var toplevelNodes = [];
    var lookupList = {};

    for (var i = 0; i < flat.length; i++) {
      var n = {
        id: flat[i].id,
        name: flat[i].name,
        parent_id: ((flat[i].parent == 0) ? null : flat[i].parent),
        children: []
      };
      lookupList[n.id] = n;
      nodes.push(n);
      if (n.parent_id == null) {
        toplevelNodes.push(n);
      }
    }

    for (var i = 0; i < nodes.length; i++) {
      var n = nodes[i];
      if (!(n.parent_id == null)) {
        lookupList[n.parent_id].children = lookupList[n.parent_id].children.concat([n]);
      }
    }
    return _.filter(lookupList, function(item){ return item.children.length == 0  });
 }

function getChatIds(link){
  
  function getPortType(port){
    if(port){
      if(port.match(/in/)){
        return 'in';
      }
      if(port.match(/out/)){
        return 'out';
      }
    }
  }
  
   var sourcePort = link.get('source').port;
   var targetPort = link.get('target').port;
   var sourceId = link.get('source').id;
   var targetId = link.get('target').id;
   
   
   
   if(sourcePort && targetPort){
     
     var portObj = {};
     var sourcePortType = getPortType( sourcePort ) ;
     var targetPortType = getPortType( targetPort );
     
     var sourceChatId = graph.getCell(sourceId).get('chatId');
     var targetChatId = graph.getCell(targetId).get('chatId');
     
     if(sourcePortType =='out'){
       return [ sourceChatId, targetChatId];
     }else{
       return [ targetChatId, sourceChatId];
     }
     
   }
}

 graph = new joint.dia.Graph
 graph.on('change:source change:target', function(link){

      var  chatIds = getChatIds(link);
      if(chatIds && chatIds.length){
        var parent = chatIds[0];
        var child = chatIds[1];
       //for out going you need to fetch and update. 
       dao.insertOrUpdateDialog({
         id: parent,
         outgoingLinkLinks: [child]
       });
       dao.insertOrUpdateDialog({
         id: child,
         parent: parent,
       });
   }    
 }).on('remove', function(cell, collection, opt) {
   if (cell.isLink()) {
     var link = cell;
     var chatIds = getChatIds(link);
     
     dao.removeOutgoingLinkLinks(chatIds[0], chatIds[1]);
     dao.removeParent(chatIds[1]);
   }
})

 var paper;

 var formToShow=null;

 $scope.toHide= function(formType){
  if(formType!=formToShow){
   return true;
  }
  return false;

 }
  
  function getCellByChatId(chatId){
    
    //get the collection of cells
    var cells = paper.model.get('cells');
    var cell = cells.find(function(model) { return model.get('chatId') == chatId; });
   return cell;
  }  
  
  function adjustGraphForCells(listIds){
      var doAdjustment = 0;
      _.each(listIds, function(item, index, array){
        var cell = getCellByChatId (item);
        var y = cell.get('position').y;     
        if(y < 90){
          doAdjustment = 1;
        }
      })
      if(doAdjustment){
        var curHeight = paper.$el.find('svg').height();
        paper.$el.find('svg').height(curHeight+400);
        joint.layout.DirectedGraph.layout(graph, { 
          setLinkVertices: false, 
          marginY:90,
          marginX:90
        });
        return true;
      }
      return false;
  }
  
  function labelText(text, label){
    if(text){
      if(label){
        text = label+' '+text
      }
      return text;
    }
    return '';
  }
  
  function createBoxHtml(item, type){
    var html = '';
    if(type=='choice'){
    
      html = '<p class="label"></p>\
        <p class="id">id: '+item.id+'</p>\
        <p class="before">'+ labelText( item.codeBefore , 'B:' )+'</p>\
        <p class="after">'+ labelText( item.codeAfter, 'A:')+'</p>\
        <p class="conditional">'+ labelText( item.conditionsString, 'C:')+'</p>';
    
    }else if(type='dialogue'){
      html = '<p class="label"></p>\
        <p class="id">id: '+item.id+'</p>\
        <p><span class="actor">'+  ( item.actor ? dao.getActor( parseInt( item.actor)).name : '' )
         +'</span> to <span class="conversant">'+ ( item.conversant ? dao.getActor( parseInt( item.conversant)).name : '' )+'</span></p>\
        <p class="menuText">'+labelText( item.menuText, 'Menu Title:' )+'</p>\
        <p class="dialogueText">'+ labelText(item.dialogueText)+'</p>\
        <p class="before">'+ labelText(item.codeBefore, 'B:')+'</p>\
        <p class="after">'+ labelText(item.codeAfter, 'A:')+'</p>\
        <p class="conditional">'+ labelText(item.conditionsString, 'C:')+'</p>\
        <p class="outgoingLinks">'+ labelText( item.outgoingLinks ? item.outgoingLinks.join(', '):'', 'O:') +'</p>';
    
      console.log('outgoing Links')
       console.log(item.outgoingLinks)
    }
    return html;
  }
  
  
  function addCells(paper){
    var chatData = dao.getData();
    if(chatData['dialogues'].length){
      var dialogues = chatData['dialogues'];
      _.each(dialogues,function(item, index, array){
       var model = null;
        if(!item.isChoice){
          model = createBox('Dialogue',[''] ,[''], '3300CC', null, createBoxHtml(item, 'dialogue'), item.id
          );
        }else{
          model = createBox('Choice',[''] ,[ ''], '2ECC71', null, createBoxHtml(item, 'choice'), item.id
          );
        }
        $scope.resizeBox(model);
        $scope.resizeBox(model);
        var allIds = _.pluck(dialogues, 'id');
        idCount = _.max(allIds)+1;
      })
      
      //add the links for the drawn out cells
      _.each(dialogues,function(item, index, array){
        
        if(item.parent){
          var parent = getCellByChatId(item.parent);
          var child = getCellByChatId(item.id);
          
          var parentId = parent.get('id');
          var childId = child.get('id');
          
          var parentPort = _.find(parent.ports, function(item){
            return  item.type=='out';
          }).id;
          
          var childPort = _.find(child.ports, function(item){
            return  item.type=='in';
          }).id
          
          
          var link = new joint.shapes.devs.Link({
             source: {
               id: parentId,
               port: parentPort
            },
            target: {
              id: childId,
              port: childPort
            }
          });
          // Assume graph has the srcModel and dstModel with in and out ports.
          graph.addCell(link)
          
          // link(parent, child);
        }
      });
      joint.layout.DirectedGraph.layout(graph, { 
        setLinkVertices: false, 
        marginY:90,
        marginX:90
      });
      var listChildren = getAdjacencyListChildren();
      var listIds = _.pluck(listChildren, 'id');
      
      while(adjustGraphForCells(listIds)){
        //console.log('adjustment occured')
      };
      
    }
    if(chatData['actors'].length){
      var actors = chatData['actors'];
      var actorNames = _.pluck(actors, 'name');
      var actorIds = _.pluck(actors, 'id');
      $scope.actors = dao.getActors();
      $scope.actorListInput = actorNames.join(', ');
      
      idActorCount = _.max(actorIds)+1;
    }
    
  }


 window.dragScrollOn = 0;   
 $scope.initDiagram =  function(caller){
   
   if(!paper){
    
    paper = new joint.dia.Paper({
     el: $('#paper'),
     width: 800,
     height: 600,
     gridSize: 1,
     model: graph,
     perpendicularLinks: true
    }).on('cell:pointerdown', function(element){
      window.dragScrollOn = 0;
      
    }).on('cell:pointerclick', function(element){
      curForm = element;
        _.each(graph.attributes.cells.models, function( item, index){
          item.attr({
            rect: { stroke: 'black', 'stroke-width':'1px' }
          })
       })
       
       element.model.attr({
         rect: { stroke: 'yellow', 'stroke-width':'3px' }
       })
   
      var savedDialogue = dao.getDialogue(curForm.model.get('chatId'));
   
      var elementType = element.model.attr('.label/text');
      if(elementType=='Choice'){
        formToShow = 'Choice';
        //this is an angular function to update the templates
        if(!$scope.choice){
          $scope.choice={};
        }
        $scope.choice.conditionsString = savedDialogue.conditionsString;
        $scope.choice.codeBefore = savedDialogue.codeBefore;
        $scope.choice.codeAfter = savedDialogue.codeAfter;
        
        $scope.$apply();
      }
      else if(elementType=='Dialogue'){
        formToShow = 'Dialogue'
        if(!$scope.dialogue){
         $scope.dialogue={};
        }
        $scope.dialogue.actor = savedDialogue.actor;
        $scope.dialogue.conversant = savedDialogue.conversant;
        $scope.dialogue.menuText = savedDialogue.menuText;
        $scope.dialogue.dialogueText = savedDialogue.dialogueText;
        $scope.dialogue.conditionsString = savedDialogue.conditionsString;
        $scope.dialogue.codeBefore = savedDialogue.codeBefore;
        $scope.dialogue.codeAfter = savedDialogue.codeAfter; 
        $scope.dialogue.outgoingLinks = savedDialogue.outgoingLinks; 
        $scope.$apply();
     }

  }).on('blank:pointerdown', function(evt, x, y) { 
    window.dragScrollOn = 1;
    
  });
  
  addCells(paper);
  
  paper.$el.height(625).width(820).css({
    overflow:'scroll'
  })
  $scope.paper = paper;
  paperGlobal = paper
   }
 };

  $scope.updateActorList = function(actorList){
    console.log(actorList)
    if(actorList){
      
      var actorListArray = actorList.split(',').map(Function.prototype.call, String.prototype.trim);
      var modelActors = dao.getActors();
      
      var nonRepeats =  _.filter(actorListArray, function(actorItem,index,array){
        var match = 0;
        _.each(modelActors, function(modelItem, index, array){
          if( actorItem == modelItem.name ){
            match=1;  
          }  
        })
        return !match;
      })
      
      //later on add logic to make names appear and reappear
      
      for(var i = 0; i < nonRepeats.length; i++){
        var actorId = idActorCount++;
        //if name is already in the database then skip it.
        dao.insertOrUpdateActor({id:actorId, name: nonRepeats[i], invisible:0});
      }
      $scope.actors = dao.getActors();
    }
  }

 //--GENERAL---------------------------------
 $scope.clear = function(asdf) {
   paperGlobal.removeCells();
   dao.clearData();
   idCount = 1;
   idActorCount = 1;
   var scope = angular.element($('#builder')).scope();
   scope.actors = [];
   scope.actorListInput = '';
   location.reload();
   //scope.$apply();
 };

 var update = function(caller){
  $scope.actors = dao.getActors();
  $scope.dialogues = dao.utils.selectDialogues( dao.getDialogues(), false );
  $scope.choices = dao.utils.selectDialogues( dao.getDialogues(), true);
  $scope.drawDiagram(caller);
 };

 var getAllInfo = function(caller){
  $scope.actors = dao.getActors();
  $scope.dialogues = dao.utils.selectDialogues( dao.getDialogues(), false );
  $scope.choices = dao.utils.selectDialogues( dao.getDialogues(), true);
  return dao.utils.getDiagramData( dao.getData() );
 };

});

myApp.controller('ExportController', function($scope, $routeParams, dao) {
  var data = dao.getData();
  data.dialogues.sort(function(a, b) {return a.id - b.id;});
  $scope.source = JSON.stringify(data, null, "\t");
});

myApp.controller('ExportFinalController', function($scope, $routeParams, dao) {

  var client = new ZeroClipboard( document.getElementById("copy-button") );

  client.on( "ready", function( readyEvent ) {
    // alert( "ZeroClipboard SWF is ready!" );
    
    client.on( "beforecopy", function( event ) {
      var code = $('pre.ng-binding').html();
      $('#copy-button').attr('data-clipboard-text', code)
    } );
    
    client.on( "aftercopy", function( event ) {
      
    } );
  } );

  var data = dao.getData();
  _.each(data['dialogues'], function(item, index, array){
    if(data['dialogues'][index]['outgoingLinkLinks'] ){
      if(data['dialogues'][index]['outgoingLinks']){
        data['dialogues'][index]['outgoingLinks'] = _.union(data['dialogues'][index]['outgoingLinkLinks'], data['dialogues'][index]['outgoingLinks']);
      }else{
        data['dialogues'][index]['outgoingLinks'] = _.clone(data['dialogues'][index]['outgoingLinkLinks']);
      }
    }  
    delete data['dialogues'][index]['outgoingLinkLinks'];
  })
  // go through each data and merge outgoingLinks with outgoingLinkLinks
  
  data.dialogues.sort(function(a, b) {return a.id - b.id;});
  $scope.source = JSON.stringify(data, null, "\t");
});
