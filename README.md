# The JIRA Awesomizer Greasemonkey Script

* Step 1, install [Greasemonkey](https://addons.mozilla.org/en-US/firefox/addon/748) (Firefox only; we can fix that if you prefer other browsers)
* Step 2, install the [Awesomizer](http://www.clientcide.com/jira/gm.user.js)
* Step 3, visit your jira dashboard (YOURJIRA/secure/Dashboard.jspa)

## Details and whatnot:

This "plugin" will add new links to the standard dashboard issues list (for instance "Open Issues: Assigned to Me" as a dashboard widget; you can also use the "Show Saved Filter" widget). These links are for things like logging work, editing tasks, etc. All of these links will open a little in-page modal window to let you make the change you want to. When you submit the form in the popup it will do so via ajax and display the results in the popup (see screen shots in the files included). This doesn't always work but it seems to 95% of the time (resolving an issue sometimes breaks; I'll work on it). You should, in theory, be able to submit the form more than once (if you get an error for example). Links in the popup, however, will always open in a new window/tab.

There is a "filter" field at the top of the dashboard that lets you type in anything and it'll filter the content of the dashboard for you (known issue: if you have more than one widget, there's only one search box for all of them; I'll work on it). Each item in the dashboard also now shows its status ("in progress" items are highlighted). So, for instance, you can type into the filter "in progress" and all the items marked as such will be displayed and everything else will disappear.

Currently changes to items do not update them (so if you change the status of an item from open to in progress, you'll have to reload to see that change in the dashboard).

This slows the page load down for the dashboard considerably. If you want to turn it off, just disable greasemonkey. Best not to open a popup until it's finished fetching all the issues (you can see them load).

This uses MooTools and there are a few dashboard plugins that include Prototype.js, which conflicts with MooTools. If you use one of these, you'll get a javascript error (several, probably). You can either not use the Awesomizer, remove these plugins from your Dashboard, or write your own damn script. The known conflicting widget is the "Favorite Filters" widget.

The code for this is all JavaScript, but it's designed for to be able to quickly extend other portions of Jira. If you have things you'd like to see work differently, feel free to ping me with ideas. Some things I want to add:

* keyboard shortcuts
* "load more" link that just fetches more issues
* the ability to refresh a single item in the list

## Environment

As mentioned above, this uses MooTools. Specifically, it uses MooTools 1.2.2 (which is not released yet), MooTools More RC2 (also not yet released), and the version of [Clientcide](http://www.clientcide,com) libs that have been reworked for those two libraries ([available on github](http://github.com/anutron/clientcide/tree/master)). There is a bash script (jira.sh) that will build moo.js for you (but not compress it) included in these files. It references "../mootools/clientcide" which is where I have my version of the clientcide repo. Specifically, I have the following:

* jira
* mootools/clientcide
* mootools/core
* mootools/more

### Hosting

Currently these scripts 