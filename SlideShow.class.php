<?php
// PHP Class for SlideShow.
// BLP 2015-04-11 -- Update code
/*
The MIT License (MIT)

Copyright (c) 2015 Barton Phillips

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.
*/

// This Class requires PHP5.4+
//
// This Class works with any javascript. I have provided a javascript
// class to demonstrate how it is used. I have also modified a
// carousel slideshow from http://www.dynamicdrive.com your can
// locate the original at
// http://www.dynamicdrive.com/dynamicindex14/carousel2.htm.
//
// This PHP Class is a proxy that lets Javascript do the work it
// can't do because of the tight sandbox it lives in.
// The Javascript communicates with this class to a) select a
// list of files either on the local system or remote system, b) acts
// as a proxy for local file access. For remote files the names in
// the list are all that is needed. For images on the local
// filesystem that are NOT in the web path one would first get the
// list of files and then do either 'get' (AJAX) or 'proxy' calls by using code
// similar to this:
//   <img src='SlideShow.php?mode=get&path="'+imagearray[i]+'"'> or
//   <img src='SlideShow.php?mode=proxy&path="'+imagearray[i]+'"'>
//
// The images are retrieved into an array via an Ajax call like this
// using prototype.js:
//   request = "SlideShow.php?mode=loc&path="+path;
//   or
//   request = "SlideShow.php?mode=url&path="+path;
//
//   then
//
//   ajaxRequest = new Ajax.Request(request, {
//      method: 'get', asynchronous: false, /* do it sync so we get
//        the images before anything else. */
//
//      onSuccess: function(trans) { succInit(trans); },
//      onFailure: function(trans) { fail(trans); } 
//   }
//   function succInit(trans) {
//     if(trans.responseText.match(/SSException/)) {
//       fail(trans);  // do something on exception
//     } else {
//       /* imageNames is an array */
//       imageNames = trans.responseText.split(",");
//     }
//   }
//
// The Javascript communicates with this class via GET queries.
// The format is:
// SlideShow.php?mode=xxx&path=yyy
// mode can be: 'loc', 'url', 'get', or 'proxy'.
// 'loc' and 'url' are a pair. They get the list of images, the first step.
// 'get' and 'proxy' are a pair they get the image from a local filesystem.
// With 'loc' and 'url' 'path' can be: local directory where pictures
// reside, or the remote url where pictures reside.
// With 'get' or 'proxy' 'path' is a relative or a fully qualified filename of a picture.
// If mode is either 'loc' or 'url' the class checks the 'path' for
// validity and then creates a list of jpg, gif, or png files.
// If mode 'proxy' this class returns the image from the local
// filesystem.
// 'proxy' should work for all browsers.
// If mode is 'get' this class returns the image from the local
// filesystem via
// Ajax as a "data:image/gif;base64," string. This only works with
// Gecko class browsers.
//
// Copyright Barton Phillips 2008. All rights reservered.
// Author: Barton Phillips
// WWW: www.bartonphillips.org, www.bartonphillips.dyndns.org
// email: bartonphillips@gmail.com
// -----------------------------------------------------------------------

// PHP5 style class

class SlideShow {
  private $mode;
  private $path;
  private $echo;
  
  public function __construct($mode, $path, $echo=true) {
    $this->mode = $mode;
    $this->path = $path;
    $this->echo = $echo;
    if($echo) {
      $this->getImageNames();
    }
  }

  // getImageNames()
  // Get all the image names from the path and mode in $this->path and $this->mode
  // set by the constructor.
  // $echo: should we echo or return results.
  
  public function getImageNames($echo=null) {
    $echo = $echo ? $echo : $this->echo;
    $path = $this->path;

    $ret = null;
    
    try {
      switch($this->mode) {
        case 'loc':
          $ret = $this->getLocal($path, $echo);
          break;

          case 'url':
          $ret = $this->getUrl($path, $echo);
          break;

          case 'get':
          case 'proxy':
          $ret = $this->getImage($this->mode, $path, $echo);
          break;

          default:
          throw new SSException("invaliid mode: '$this->mode'");
      }
    } catch (Exception $e) {
      Header("Content-type: text/html");
      echo $e->__toString();
    }
    return $ret;
  }

  private function getLocal($path, $echo) {
    // Get the list form the local file system
    // The path can be relative or absolute.
    // If relative it is relative to the location of SlideShow.php

    if(substr($path, -1) != '/') {
      $path .= '/'; // if no terminating / put one there.
    }
        
    // Check the path for validity

    if(!is_dir($path)) {
      throw new SSException("path not valid: ($path) for mode: ($this->mode)");
    }

    // path is ok now look for gif, jpg, or png files

    $ar = @glob("$path*.{gif,GIF,jpg,JPG,png,PNG}", GLOB_BRACE);

    if($ar === false) {
      throw new SSException("error doing glob");
    }

    if(empty($ar)) {
      // no files found
      throw new SSException("no files found");
    }
    // $ar is an array of filenames so make it a comma seperated list

    //Header("Content-type: text/plain");

//    $root = $_SERVER['DOCUMENT_ROOT'];
//    $ar = preg_replace("~^$root(.*)~", "$1", $ar);

    if($echo) {
      echo implode(',', $ar);
    } else {
      $str = '';
      foreach($ar as $v) {
        $str .= "'$v',";
      }
      return rtrim($str, ',');
    }
  }

  private function getUrl($path, $echo) {
    // path is a FULLY qualified url. That is it has http:// as a
    // start.
    // You could use curl to do this or fopen or file_get_contents. I
    // have chosen file_get_contents for two reasons first,
    // because it means you don't have to have the curl library,
    // although most modern distributions do have it, and second I
    // don't need to do fgets's to get the contents.

    if(substr($path, -1) != '/') {
      $path .= '/'; // if no terminating / put one there.
    }

    $data = @file_get_contents($path);

    if(!$data) {
      $err = error_get_last();
      
      if($err === null) {
        throw new SSException("url not found");
      } else {
        throw new SSException("file error: " . $err['message']);
      }
    }

    // now parse the file and look for the files. The format of a
    // directory is 'stuff href="filename.ext" stuff'.
    // Make an array of lines

    $ar = explode("\n", $data);

    $data = '';
    foreach($ar as $line) {
      if(preg_match('/^.*href="(.*\.((gif)|(jpg)|(png)))">.*$/i', $line, $m)) {
        $data .= $path . $m[1] . ',';
      }
    }
    $data = rtrim($data, ',');  // strip off the trailing comma
    //Header("Content-type: text/plain");

    if($echo) {
      echo $data;
    } else {
      return $data;
    }
  }

  // getImage()
  // $mode: get or proxy
  // $path: path to images
  // $echo: if true we echo results else return them.
  
  
  private function getImage($mode, $path, $echo) {
    // For IE and some others we can't use the
    // "data:image/gif;base64," format so the javascript creates am
    // image that looks like <img src='SlideShow.class.php?path=filename'
    // .../>

    // get the extension of the file

    $ext = strtolower(pathinfo($path, PATHINFO_EXTENSION));

    if(!preg_match('/(gif)|(jpg)|(png)/', $ext)) {
      throw new SSException("not an image extension: ($ext)");
    }

    $filesize= filesize("$path");
    $data = @file_get_contents("$path");

    if(!$data) {
      $err = error_get_last();

      
      if($err === null) {
        throw new SSException("url not found");
      } else {
        throw new SSException("file error: " . $err['message']);
      }
    }

    // $mode is 'get' or 'proxy'

    if($mode == 'proxy') {
      // Browser does not support base64 encoded url's

      if($echo) {
        header("Content-type: image/$ext");
        header("Content-length: $filesize");
        echo $data;
      } else {
        return $data;
      }
    } else {
      // $mode must be 'get' because it is not 'proxy'
      // This is a version for the local files that uses the
      // "data:image/gif;base64," format via an Ajax call. The above
      // method will work for all browsers but I thought this was neat
      // so I decided to use it on Gecko grade browsers just for fun.
      // Take the data and make it base64

      $data = base64_encode($data);
      if($echo) {
        header("Content-type: text/plain");
        header("Content-length: ". strlen($data));
        echo "data:image/$ext;base64,$data";
      } else {
        return "data:image/$ext;base64,$data";
      }
    }  
  }
}

// Only instantiate if $_GET has mode and path.
// every time this file is called we instantiate the class anew.

if(isset($_GET['mode']) && isset($_GET['path'])) {
  new SlideShow($_GET['mode'], $_GET['path']);
}

// ------------------------------------------------------
// SSException class for SlideShow exceptions

class SSException extends Exception {
  // message, code. file, and line are members of Exception
  
  public function __construct($message, $code=-1) {
    parent::__construct($message, $code);
  }

  public function __toString() {
    return __CLASS__ . "{ [FILE=$this->file] [LINE=$this->line] [Error='$this->message'] }";
  }
}
