<!DOCTYPE html> 
<html> 
	<head> 
	<!--
  <script src="https://ajax.googleapis.com/ajax/libs/jquery/1.4.4/jquery.min.js"></script>
  <script src="coffee-script.js"></script>  
  <script src="jquery-mobile.js"></script>
  -->
  <script src="jquery.min.js"></script>
  <!--<script src="coffee-jquery-jquery-mobile-min.js"></script>-->
  <script src="jquery-mobile-min.js"></script>
  <script src="json2.js"></script>
  <script src="underscore-min.js"></script>
  <script src="backbone-min.js"></script>
  <script src="jquery.prettydate.js"></script>
  <!--<script src="application.coffee" type="text/coffeescript"></script>-->
  <script src="application.js"></script>
  <link rel="stylesheet" href="jquery-mobile.css" />

<script type="text/javascript">
function S4() {
   return (((1+Math.random())*0x10000)|0).toString(16).substring(1);
}
function guid() {
   return (S4()+S4()+"-"+S4()+"-"+S4()+"-"+S4()+"-"+S4()+S4()+S4());
}
</script>
</head>
<body> 

<div data-role="page">
  
	<div data-role="header">
		<h1>Dreamfish Mobile Client</h1>
	</div>
	<h5 id="Welcome"></h5>
  <div id="flash"></div>
	<div data-role="content" id="content" class="ui-content ui-body-c" role="main">	

	</div>
  
	
</div>

</body>
</html>