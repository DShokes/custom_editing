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
    			var operationalLayer;
    			this.map = new esri.Map("map", {
		          basemap: "streets",
		          center: [-118.407, 34.452],
		          zoom: 13
		        });
		        
		        /*dojo.connect(this.map, "onLayersAddResult", lang.hitch(this, 'initSelectToolbar'));*/

		        operationalLayer = new FeatureLayer("http://sampleserver5.arcgisonline.com/ArcGIS/rest/services/Energy/Geology/FeatureServer/9", { 
			          mode: FeatureLayer.MODE_ONDEMAND,
			          outFields: ["OBJECTID","lithology_type","metamorphic_facies","geomodifications"]
			        });
         
        		operationalLayer.setSelectionSymbol(new esri.symbol.SimpleFillSymbol());

        		dojo.connect(this.map,'onLayersAddResult',function(results){
        			var layerInfos = [{
		            'featureLayer': operationalLayer,
		            'showAttachments': false,
		            'isEditable': true,
		            'showDeleteButton': false,
		            'fieldInfos': [
		              {'fieldName': 'OBJECTID','tooltip': 'The station id.', 'label':'Object ID:','isEditable':false},
		              {'fieldName': 'lithology_type', 'tooltip': 'The lithology type of the rock unit', 'label':'Lithology','isEditable':false},
		              {'fieldName': 'metamorphic_facies','label':'Facies:','isEditable':false},
		              {'fieldName': 'geomodifications', 'label':'Geomodifications','isEditable':true}
		            ]
		          }];
        		var attInspector = new esri.dijit.AttributeInspector({
            		layerInfos: layerInfos
          				}, "attributesDiv");
        		});
    			
		         var selectQuery = new esri.tasks.Query();
        			
        		dojo.connect(this.map, "onClick", function(evt) {
		          //dojo.byId('details').innerHTML = '';
		          selectQuery.geometry = evt.mapPoint;
		          selectQuery.objectIds = [evt.graphic.attributes.objectid];
		          operationalLayer.selectFeatures(selectQuery, esri.layers.FeatureLayer.SELECTION_NEW, null);

		        });

        		this.map.addLayers([operationalLayer]);
                
    		},
    		initWidgets: function(){
    			// init the esri geocode widget 
    		}
	}

});

