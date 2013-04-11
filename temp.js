// main JavaScript file. This is where the majic happens. 


define(['esri/map',
	    'esri/arcgis/utils',
	    "esri/dijit/AttributeInspector-all",
	    'esri/layers/FeatureLayer',
	    "esri/tasks/query",
	    'dojo/dom',
	    "esri/main",
	    "dojo/_base/array",
	    "dojo/_base/lang",
	    "dojo/parser","dojo/_base/lang",'dojo/on',"dojo/dom-construct",
		"dijit/layout/BorderContainer",
		"dijit/layout/ContentPane","dijit/layout/TabContainer",
		"dojo/domReady!"],function(Map,esriUtils,attrInspect,FeatureLayer,esriQuery,dom,esri,array,lang,parser,lang,on, domConstruct){
		
		return{
			
    		startup: function(){
    			 parser.parse();
    			//This sample requires a proxy page to handle communications with the ArcGIS Server services. You will need to  
    			//replace the url below with the location of a proxy on your machine. See the 'Using the proxy page' help topic 
    			//for details on setting up a proxy page.
    			esri.config.defaults.io.proxyUrl = "/proxy";

    			//This service is for development and testing purposes only. We recommend that you create your own geometry service for use within your applications
    			esri.config.defaults.geometryService = new esri.tasks.GeometryService("http://tasks.arcgisonline.com/ArcGIS/rest/services/Geometry/GeometryServer");
    			
    			this.initMap();
    		},
    		initMap: function(){
    			this.map = new esri.Map("map", {
		          basemap: "streets",
		          center: [-97.395, 37.537],
		          zoom: 11
		        });
		        
		        dojo.connect(this.map, "onLayersAddResult", lang.hitch(this, 'initSelectToolbar'));

		        var petroFieldsMSL = new esri.layers.ArcGISDynamicMapServiceLayer("http://sampleserver3.arcgisonline.com/ArcGIS/rest/services/Petroleum/KSFields/MapServer");
		        petroFieldsMSL.setDisableClientCaching(true);
		        this.map.addLayer(petroFieldsMSL);

		        var petroFieldsFL = new esri.layers.FeatureLayer("http://sampleserver3.arcgisonline.com/ArcGIS/rest/services/Petroleum/KSFields/FeatureServer/0", {
		          mode: FeatureLayer.MODE_SELECTION,
		          outFields: ["approxacre","objectid","field_name","activeprod","cumm_oil","cumm_gas","avgdepth"]
		        });
		        var selectionSymbol = new esri.symbol.SimpleFillSymbol(esri.symbol.SimpleFillSymbol.STYLE_NULL, new esri.symbol.SimpleLineSymbol("dashdot", new dojo.Color("yellow"), 2),null);
		        petroFieldsFL.setSelectionSymbol(selectionSymbol);

		        dojo.connect(petroFieldsFL, "onEditsComplete", this,function() {
		          petroFieldsMSL.refresh();
		        });

		        this.map.addLayers([petroFieldsFL]);
                
    		},

    		initSelectToolbar: function(results) {
    			var updateFeature;
    			console.log("start here");
    			var petroFieldsFL = results[0].layer;
    			console.log("petro field : " + petroFieldsFL);
		        var selectQuery = new esri.tasks.Query();

		        dojo.connect(this.map, "onClick", this, function(evt) {

		        	map = this.map;
		        	console.log("map click");
		        	selectQuery.geometry = evt.mapPoint;
		        	console.log("Query geom" + selectQuery.geometry);
		          	petroFieldsFL.selectFeatures(selectQuery, FeatureLayer.SELECTION_NEW, function(features) {
		            	
			            if (features.length > 0) {
			             //store the current feature
			              updateFeature = features[0];
			              
			              this.map.infoWindow.setTitle(features[0].getLayer().name);
			              this.map.infoWindow.show(evt.screenPoint,this.map.getInfoWindowAnchor(evt.screenPoint));
			            } else {
			              this.map.infoWindow.hide();
			            }
		          });
		          
		        });

		        dojo.connect(this.map.infoWindow, "onHide", this, function() {
		          petroFieldsFL.clearSelection();
		        });

		        var layerInfos = [{
		          'featureLayer': petroFieldsFL,
		          'showAttachments': false,
		          'isEditable': true,
		          'fieldInfos': [
		            {'fieldName': 'activeprod', 'isEditable':true, 'tooltip': 'Current Status', 'label':'Status:'},
		            {'fieldName': 'field_name', 'isEditable':true, 'tooltip': 'The name of this oil field', 'label':'Field Name:'},
		            {'fieldName': 'approxacre', 'isEditable':false,'label':'Acreage:'},
		            {'fieldName': 'avgdepth', 'isEditable':false, 'label':'Average Depth:'},
		            {'fieldName': 'cumm_oil', 'isEditable':false, 'label':'Cummulative Oil:'},
		            {'fieldName': 'cumm_gas', 'isEditable':false, 'label':'Cummulative Gas:'}
		          ]
		        }];

		        var attInspector = new attrInspect({
		          layerInfos:layerInfos
		        }, domConstruct.create("div"));
		        //add a save button next to the delete button
		        var saveButton = new dijit.form.Button({label:"Save","class":"saveButton"});
		        domConstruct.place(saveButton.domNode, attInspector.deleteBtn.domNode, "after");
		       
		        dojo.connect(saveButton,"onClick",this,function(){
		           updateFeature.getLayer().applyEdits(null, [updateFeature], null);         
		        });
		        
		        dojo.connect(attInspector, "onAttributeChange",this, function(feature,fieldName,newFieldValue) {
		          //store the updates to apply when the save button is clicked 
		           updateFeature.attributes[fieldName] = newFieldValue;
		        });
		        
		        dojo.connect(attInspector,"onNext",this,function(feature){
		          updateFeature = feature;
		          console.log("Next " + updateFeature.attributes.objectid);
		        });
		        
		        dojo.connect(attInspector, "onDelete",this,function(feature){
		          feature.getLayer().applyEdits(null,null,[feature]);
		          this.map.infoWindow.hide();
		        });

		        this.map.infoWindow.setContent(attInspector.domNode);
		        this.map.infoWindow.resize(325, 220);
		        
		    },
    		initWidgets: function(){
    			// init the esri geocode widget 
    		}
	}

});

