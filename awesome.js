if (document.body.getElement('*')) {
	//add our css
	document.head.adopt(new Element('link', {
		type: 'text/css',
		rel: 'StyleSheet',
		media: 'all',
		href: 'http://www.clientcide.com/jira/styles.css'
	}));
	//let's make Request.HTML integrate with our app a bit
	//we need to scrap pages a lot to get chunks of the response
	Request.HTML = Class.refactor(Request.HTML, {
		options: {
			filter: null,
			evalScripts: true
		},
		onSuccess: function(tree, elements, html, javascript) {
			//if there's a filter defined
			if (!this.options.filter) return this.parent.apply(this, arguments);
			//filter the element through the awesome.filter method
			elements = $$(awesome.filter(this.options.filter, elements));
			//if we're updating a dom element, do so
			if (this.options.update) $(this.options.update).empty().adopt(elements)
			//THEN exec our scripts
			if (this.options.evalScripts) $exec(javascript);
			//pass on to onSuccess as usual
			return this.parent(tree, elements, html, javascript);
		}
	});
	//this class lets you type into an input and filter dom elements that don't contain that text
	var SearchFilter = new Class({
		Implements: Options,
		options: {
			injectWhere: 'top',
			inputStyles: {
				'float':'right'
			},
			textFilter: '.browser, span',
			display: 'table-row'
		},
		initialize: function(inputContainer, options) {
			this.setOptions(options);
			//figure out where we're going to shove our input
			this.inputContainer = $(inputContainer);
			//make the input
			this.makeInput();
			//inject the input into our container
			this.search.inject(this.inputContainer, this.options.injectWhere)
			//show some hint text
			new OverText(this.search);
		},
		makeInput: function(){
			var tester;
			//make our input
			this.search = new Element('input', {
				title: 'filter items',
				events: {
					keyup: function(e) {
						$clear(tester);
						//let's not overload the browser as the user types; wait a little for another keystroke
						tester = function(){
							//loop though the elements and hide the ones that don't match the filter
							this.elements.each(function(el, i){
								var txt = (this.options.textFilter ? el.getElements(this.options.textFilter) : [el]).get('html').join(' ');
								if (!txt.toLowerCase().contains(this.search.get('value').toLowerCase())) this.containers[i].hide();
								else this.containers[i].show(this.options.display);
							}, this)
						}.delay(100, this);
					}.bind(this)
				}
			}).setStyles(this.options.inputStyles);
		},
		elements: $$(),
		containers: $$(),
		//method to add new elements to the filter
		//element = the element to filter on
		//container = the element to hide when no match is made (optional)
		addElement: function(element, container) {
			this.elements.include($(element));
			this.containers.include($(container || element));
		}
	});

	var awesome = {
		//startup method
		init: function(){
			awesome.setUserName();
		},
		//fetches the user's username from the header
		setUserName: function(){
			var profile = document.getElement('ul#account-options a').get('href');
			awesome.user = profile.split('?')[1].parseQueryString().name;
		},
		//get's the bugs id from a url - like CCS-123
		getBugId: function(href){
			return href.split('/').getLast();
		},
		//gets the internal integer based id from a url
		getIntId: function(href){
			var match = href.match(/id=(\d+)/);
			return match ? match[1] : null;
		},
		//creates a link to a task; if there's a prompter for the task, calls it on click.
		linkTo: function(id, intId, task) {
			var href = awesome.getTaskUrl(id, intId, task);
			return new Element('a', {
				text: task,
				'class': 'shortcut',
				href: href,
				events: {
					click: function(e){
						if (awesome.filters[task]) {
							e.stop();
							this.getParent('tr').wait();
							awesome.prompt(task, {href: href}, function(){
								this.getParent('tr').release();
							}.bind(this));
						}
					}
				}
			});
		},
		//gets the url for a given task
		getTaskUrl: function(id, intId, task) {
			if (!awesome.urls[task]) return null;
			return awesome.urls[task].substitute({
				id: id,
				intId: intId,
				user: awesome.user
			});
		},
		//filters elements for a given task; see awesome.filters
		filter: function(what, elements) {
			var filtered = elements.filter(awesome.filters[what].selector);
			return awesome.filters[what].finder ? awesome.filters[what].finder(filtered) : filtered;
		},
		//filters for tasks
		//selector is applied to the elements
		//if defined, finder is applied to the result of that filter - it's optional
		filters: {
			comments: {
				selector: '#issue_actions_container',
				finder: function(elements) {
					return elements[0];
				}
			},
			status: {
				selector: '#issuedetails',
				finder: function(elements) {
					return elements[0].getElement('td:contains(Status)').getNext().get('html').stripTags().trim()
				}
			},
			logWork: {
				selector: '#issueContent',
				finder: function(elements) {
					return elements[0]
				}
			},
			issueContent: {
				selector: '#issueContent',
				finder: function(elements){
					return elements[0]
				}
			},
			startReview: {
				selector: '#issueContent',
				finder: function(elements) {
					return elements[0]
				}
			},
			resolveIssue: {
				selector: '#issueContent',
				finder: function(elements) {
					return elements[0]
				}
			},
			quickResolve:  {
				selector: '#issueContent',
				finder: function(elements) {
					return elements[0]
				}
			},
			startProgress: {
				selector: '#issueContent',
				finder: function(elements) {
					return elements[0]
				}
			},
			addProgress: {
				selector: '#issueContent',
				finder: function(elements) {
					return elements[0]
				}
			},
			edit:  {
				selector: '#issueContent',
				finder: function(elements) {
					return elements[0]
				}
			}
		},
		//url patterns for pages
		urls: {
			startReview: "/secure/WorkflowUIDispatcher.jspa?id={intId}&action=731",
			resolveIssue: "/secure/WorkflowUIDispatcher.jspa?id={intId}&action=711",
			quickResolve: "/secure/CommentAssignIssue.jspa?customfield_10011=https%3A%2F%2Fgit.cloudera.com%2Freviewboard%2Fr%2F279%2F&timetracking=0m&action=711&id={intId}&viewIssueKey=&Resolve Issue=Resolve%20Issue&/browse/{id}=Cancel&assignee={user}&resolution=1",
			startProgress: "/secure/WorkflowUIDispatcher.jspa?id={intId}&action=4",
			addProgress: "/secure/AddComment!default.jspa?id={intId}",
			edit: "/secure/EditIssue!default.jspa?id={intId}",
			logWork: "https://jira.cloudera.com/secure/CreateWorklog!default.jspa?id={intId}"
		},
		//prompts user with contents of a task
		prompt: function(task, options, onComplete) {
			//fetch the page
			new Request.HTML({
				url: options.href || awesome.getTaskUrl(options.id, options.intId, options.task),
				filter: task,
				onComplete: function(tree, elements){
					//call the callback
					(onComplete || $empty)();
					//get the first element
					var element = elements[0];
					//set it's overflow
					element.setStyles({
						overflow: 'auto',
						maxHeight: 400
					});
					//show it to the user
					var win = new StickyWin.Modal({
						destroyOnClose: true,
						draggable: true,
						content: StickyWin.ui(task, element, {
							width: 800,
							cornerHandle: true,
							buttons: [
								{
									text: 'Close'
								}
							]
						})
					});
					//make the contents ajaxy
					awesome.fupdate(win.win);
				}
			}).send();
		},
		//makes all links in a container open in a new window/tab
		//makes first form ajaxy
		fupdate: function(content) {
			content.getElements('a').set('target', '_blank');
				var form = content.getElement('form');
			if (!form) return;
			var target = form.getParent();
			new Fupdate(form, target, {
				requestOptions: {
					waiterTarget: target,
					filter: 'issueContent'
				},
				onSuccess: function(updated){
					awesome.fupdate(target);
				}
			});
		},
		//views; these are defined for each page of jira you want to enhance
		//Dashboard is the only one so far
		//the name of the view ("Dashboard") will be checked against the window.location
		//so "Dashboard" will only run if the window.location contains "Dashboard"
		views: $H({
			Dashboard: new Class({
				initialize: function(){
					var searchTr;
					//get all the table rows in the dashboard
					$$('table[id^=searchresults] tr').each(function(tr, i) {
						//get the td with the link in it
						var td = tr.getElements('td')[2];
						//if not there, this is the top row; we'll put our search box here
						if (!td) return searchTr = tr;
						//get the link to the bug
						var browse = td.getElement('a').get('href');
						//get the id for the bug
						var id = awesome.getBugId(browse);
						//fetch the bug's browse page
						new Request.HTML({
							url: browse,
							onSuccess: function(tree, elements, html, js){
								//enhance the table row
								this.enhanceBugLink(td, id, html, elements)
							}.bind(this)
						}).send();
					}, this);
					//add our search filter
					this.searchFilter = new SearchFilter(searchTr.getElement('td'))
				},
				enhanceBugLink: function(td, id, html, elements){
					//add this row to the search filter
					this.searchFilter.addElement(td, td.getParent('tr'));
					//get the intId for the bug
					var intId = awesome.getIntId(html);
					//add a class to this td for styling
					td.addClass('enhanced');
					//get the link that's there and add a class to it for styling
					var link = td.getElement('a').addClass('browser');
					//create links for all our actions
					var linkContainer = new Element('div', {
						'class':'mainLinks'
					}).inject(td);
					var mainLinks = ['edit','startReview','resolveIssue',
					 				 'quickResolve','startProgress','addProgress','logWork'].map(function(task){
						var a = awesome.linkTo(id, intId, task);
						//drop the link in after our main link
						a.inject(linkContainer);
						return a;
					}, this);
					//fetch the comments
					var comments = awesome.filter('comments', elements);
					if (comments) {
						if (!comments.get('html').contains('No work has yet been logged on this issue.') &&
							!comments.get('html').contains('There are no comments yet on this issue.')) {
							//create a link to preview the comments
							var preview = new Element('a', {
								html: 'show comments',
								href: 'javascript:void(0)',
								'class':'shortcut',
								events: {
									click: function(e){
										e.stop();
										comments.get('reveal').toggle();
									}
								}
							}).inject(linkContainer, 'top');
							mainLinks.push(preview);
							td.adopt(comments.hide());
						}
					}
					//get the status
					var status = awesome.filter('status', elements);
					if (status) {
						new Element('span', {
							html: ' (' + status + ')'
						}).inject(link, 'after');
						if (status == "In Progress") td.addClass('inProgress');
					}
					td.getElements('a').set('target', '_blank');
				}
			})
		}),
		loaded: []
	};
	//startup
	awesome.views.each(function(klass, view) {
		awesome.init();
		//if the window location matches the name of this view
		//execute that view
		if (document.location.href.contains(view)) new klass();
	});
}