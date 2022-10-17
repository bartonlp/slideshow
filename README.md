# slideshow

## BLP 2022-10-17 - updated. Removed prototype logic. Works with php 8.1

The SlideShow PHP class gets a list of images from the local filesystem or from a remote
web site. 

A JavaScript class displays the images collected by the PHP class.

## History

This was originally written in 2008. This version (April 2015) is a
rewrite of that code. I have upgraded the code to use more recent inovation.

## Disclaimer

I have not tried any of this with IE on any version of Windows. I don't use MS-Windows, I 
don't like MS-Window, and I don't have MS-Windows. 
I have always hated that OS for what I think are very good reasons.

I use Linux Mint which evolved from Ubuntu via Debian. I have not tested this package on
any OS that has not evolved from Debian.

## Install

There are two ways to install the package:

1. Download the zip file from http://github.com/bartonlp/slideshow. Extract the files.
2. Use 'composer' (https://getcomposer.org/download/):
   If you don't have composer do:
```
curl -sS https://getcomposer.org/installer | php
```
Or if you don't have curl:
```
php -r "readfile('https://getcomposer.org/installer');" | php
```
After composer is downloaded move the 'composer.phar' to '/usr/local/bin/composer' and make
sure it is executable. 

To install the SlideShow make a project directory as follows:
```
mkdir myproject
cd myproject
composer require bartonlp/slideshow:dev-master
```
The package is under the 'vendor/bartonlp/slideshow' directory. You can run the examples from
there or copy them to your project root.


## Examples

There are several example files:

* photos-jquery.html
* photos-jquery.php
* carousel.html

'photos-jquery.html' uses the jQuery JavaScript framework (http://jquery.com) via a CDN
(Content Delivery Network).

'photos-jquery.php' is like the above HTML but instantiates the class differently.

'carousel.html' is an adaptation of Harry Armadillo 
(http://www.codingforums.com/showthread.php?t=58814) nice program. 
Visit Dynamic Drive at http://www.dynamicdrive.com/ for full source code etc.

To install this demo do a 'tar xvzf SlideShow.tar.gz' in the 'Document
Root' of the web server or in a sub-directory. The tar will create a
'photosTest' directory and 'photosTest/images'. If you have already
untared this demo some place else before you read this README you can
just do a 'mv photosTest <Docuement Root>'.

## Configure the Examples

You may need to configure the 'photos-jquery.html' file for your filesystem. At the beginning
of the file there are several statements in the &lt;head&gt; section.

To contact me email to bartonphillips@gmail.com

Enjoy

Barton Phillips
 Copyright &copy; 2022 Barton Phillips
 bartonphillips@gmail.com
 http://www.bartonphillips.com
 Last Modified 2022-10-17
