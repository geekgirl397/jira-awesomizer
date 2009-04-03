CUR_DIR=`pwd`

cd ../mootools/clientcide
ruby ./build.rb StickyWin.UI Request.HTML Fx.Reveal Selectors Waiter URI OverText StickyWin.Modal Fupdate
mv built.js $CUR_DIR/moo2.js
