<?
$key = $_REQUEST["key"];
$filename = dirname ( __FILE__ ) . '//data//' . $key;

if ($key == 'guid') {
  echo json_encode($_SESSION);
}
if ($_SERVER['REQUEST_METHOD'] == 'POST') {
	$data = str_replace('\\"', '"', $_REQUEST["data"])	;
	$fh = fopen('data//' . $key, 'w') or die("can't open file");
	fwrite($fh, $data);
	fclose($fh);
} else {
	if (!file_exists($filename)) {
		die("[]");	
	}
	$fh = fopen($filename, 'r') or die("can't open file");
	$data = fread($fh, filesize($filename));
	fclose($fh);
	echo $data;
}
?>