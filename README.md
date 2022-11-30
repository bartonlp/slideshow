# Slideshow Class

## BLP 2022-11-30 - Updated.
Removed prototype logic. Works with php 8.1. Added more demos. Removed carousel.html as it ses prototype.js which is 
no longer supported.

---

The SlideShow PHP class gets a list of images from the local filesystem or from a remote
web site. 

A JavaScript class displays the images collected by the PHP class.

## History

This was originally written in 2008. This version is a
rewrite of that code. I have upgraded the code to use more recent inovations.

## Disclaimer

I have not tried any of this with IE on any version of Windows. I don't use MS-Windows, I 
don't like MS-Window, and I don't have MS-Windows. 
I have always hated that OS for what I think are very good reasons.

I use Ubuntu Mate. I have not tested this package on
any OS that has not evolved from Debian.

## Install

There are three ways to install the package:

1. Download the zip file from http://github.com/bartonlp/slideshow. Extract the files.
2. Use 'composer' (https://getcomposer.org/download/):
3. Go to https://github.com/bartonlp/slideshow and then click on the green *Code* button. Select the the *Clone* address provided.
Then create a directory on a server (or your local computer if you are running Apache) and type *git clone {the selection from above}*.
You now have a directory *slideshow* under your webpage name.

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

## Extra Stuff

The are several additional directories for the project:

* __images__: this has the image files for the demos.
* __kb__: this has a slideshow that I got from *http://www.dynamicdrive.com*. It is interesting.
* __burnsimages__: this has some images for the *kenburns.html* in the *kb* directory.

## Examples

There are several example files:

* photos-jquery.html
* photos-jquery.php
* photos.php
* photos1.php
* photos2.php
* photos3.php

## Configure the Examples

You may need to configure the *demo* files for your filesystem. At the beginning
of the files there are several statements. The files are pretty well documented.

Contact me at: [bartonphillips@gmail.com](mailto:bartonphillips@gmail.com)

Enjoy

Copyright &copy; 2022 Barton Phillips  
http://www.bartonphillips.com  
Last Modified 2022-11-30
