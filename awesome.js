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
				title: 'filter items (esc clears)',
				events: {
					keyup: function(e) {
						if (e.key == "esc") this.search.set('value', '');
						$clear(tester);
						//let's not overload the browser as the user types; wait a little for another keystroke
						tester = function(){
							//loop though the elements and hide the ones that don't match the filter
							this.elements.each(function(el, i){
								var txt = (this.options.textFilter ? el.getElements(this.options.textFilter) : $$([el])).get('html').join(' ');
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
			startReview: "/secure/WorkflowUIDispatcher.jspa?id={intId}&action=5",
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
				evalScripts: false,
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
			IssueNavigator: new Class({
				Implements: Events,
				Binds:[],
				initialize: function(){
					this.container = $('issuetable');
					if (!this.container) return;
					this.searchbox = new Element('div', {
						'class':'searchBoxContainer'
					}).inject(this.container, 'before');
					this.awesomeize.delay(200, this);
				},
				disableCalendar: function(){
					if (window.Calendar) {
						Calendar.setupOrg = Calendar.setup;
						Calendar.setup = function(){
							dbug.log('cal: ', arguments)
						}
					}
				},
				awesomeize: function(e){
					dbug.log('awesomizing')
					if (e && e.stop) e.stop();
					// this.loader.set('html', 'awesomizing...').removeEvents('click');
					this.search = new SearchFilter(this.searchbox, {
						textFilter: false
					});
					this.enhanceTable(this.container);
					this.addEvent('tableLoaded', function(){
						this.fireEvent('awesomed');
					}.bind(this));
				},
				enhanceTable: function(table){
					var enhance;
					//get all the table rows in the dashboard
					table.getElements('tr[id^=issuerow]').each(function(tr, i) {
						this.search.addElement(tr, tr);
						//get the td with the link in it
						var td = tr.getElement('td.issuekey');
						//if not there, this is the top row; we'll put our search box here
						if (!td) return;
						enhance = true;
						//get the link to the bug
						var browse = td.getElement('a').get('href');
						//get the id for the bug
						var id = awesome.getBugId(browse);
						this.setupEnhance(td, id);
					}, this);
					this.fireEvent('tableLoaded');
				},
				setupEnhance: function(td, id) {
					var tr = td.getParent('tr');
					td = tr.getElement('td.summary');
					//add a class to this td for styling
					tr.addClass('enhanced');
					var timer, loaded;
					var linkContainer = new Element('div', {
						'class':'mainLinks',
						events: {
							mouseenter: function(){
								$clear(timer);
								if (loaded) return;
								timer = function(){
									loaded = true;
									this.enhanceTd(td, id);
								}.delay(300, this)
							}.bind(this),
							mouseleave: function(){
								$clear(timer)
							},
							click: function(){
								if (loaded) return;
								loaded = true;
								this.enhanceTd(td, id);
							}.bind(this)
						}
					}).inject(td);
					['edit','startReview','resolveIssue', 'quickResolve','startProgress','addProgress','logWork'].each(function(txt) {
						linkContainer.adopt(new Element('a', {
							'class':'disabled',
							'html':txt
						}))
					});
					var position = function(){
						linkContainer.position({
							relativeTo: tr,
							edge: 'topRight',
							position: 'bottomRight',
							offset:{
								x: 1
							}
						}).setStyle('display', '');
					};
					tr.addEvent('mouseover', position);
				},
				enhanceTd: function(td, id) {
					this.disableCalendar();
					td.getElement('.mainLinks').removeEvents().wait();
					//get the link to the bug
					var browse = td.getElement('a').get('href');
					//fetch the bug's browse page
					new Request.HTML({
						url: browse,
						evalScripts: false,
						onSuccess: function(tree, elements, html, js){
							//enhance the table row
							this.enhanceBugLink(td, id, html, elements)
						}.bind(this)
					}).send();
				},
				enhanceBugLink: function(td, id, html, elements){
					var tr = td.getParent('tr');
					td = tr.getElement('td.summary');
					var linkContainer = td.getElement('div.mainLinks').release().empty();
					//get the intId for the bug
					var intId = awesome.getIntId(html);
					if (!intId) return;
					//get the link that's there and add a class to it for styling
					var link = td.getElement('a').addClass('browser');
					//create links for all our actions
					var mainLinks = ['edit','startReview','resolveIssue',
					 				 'quickResolve','startProgress','addProgress','logWork'].map(function(task){
						var a = awesome.linkTo(id, intId, task)
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
							var ctr = new Element('tr').inject(tr, 'after').addClass('awesomeComments')
							var ctd = new Element('td', {
								colspan: tr.getChildren('td').length
							}).inject(ctr);
							comments.hide().inject(ctd);
						}
					}
					linkContainer.position({
						relativeTo: tr,
						edge: 'topRight',
						position: 'bottomRight',
						offset:{
							x: 1
						}
					}).setStyle('display', '');
				}
			}),
			Dashboard: new Class({
				Implements: Events,
				Binds: ['enhanceTable'],
				initialize: function(){
					this.tables = $$('table[id^=searchresults]');
					this.completed = []
					var container = document.getElement('table');
					this.tables.each(this.enhanceTable);
					this.addEvent('tableLoaded', function(t){
						this.completed.include(t);
						var complete = true;
						this.tables.each(function(t){
							if (!this.completed.contains(t)) complete = false;
						}, this);
						if (complete) this.fireEvent('awesomed');
					}.bind(this));
					this.addEvent("awesomed", function(){
						OverText.update();
					});
				},
				enhanceTable: function(table){
					var searchTr = table.getElement('tr.rowHeader'),
						enhance, 
						requests = [];
					//get all the table rows in the dashboard
					table.getElements('tr').each(function(tr, i) {
						//get the td with the link in it
						var td = tr.getElements('td')[2];
						//if not there, this is the top row; we'll put our search box here
						if (!td) return;
						enhance = true;
						//get the link to the bug
						var browse = td.getElement('a').get('href');
						//get the id for the bug
						var id = awesome.getBugId(browse);
						//fetch the bug's browse page
						requests[i] = new Request.HTML({
							url: browse,
							onSuccess: function(tree, elements, html, js){
								//enhance the table row
								this.enhanceBugLink(td, id, html, elements)
								requests[i] = false;
								if (!requests.some(function(r){ return r })) {
									this.fireEvent('tableLoaded', table);
								}
							}.bind(this)
						}).send();
					}, this);
					//add our search filter
					if (enhance) {
						table.store('searchFilter', new SearchFilter(searchTr.getElement('td')));
					} else {
						this.completed.include(table);
					}
				},
				enhanceBugLink: function(td, id, html, elements){
					//get the intId for the bug
					var intId = awesome.getIntId(html);
					if (!intId) return;
					//add this row to the search filter
					var table = td.getParent('table');
					var searchFilter = table.retrieve('searchFilter');
					searchFilter.addElement(td, td.getParent('tr'));
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
		if (document.location.href.contains(view)) {
			new klass();
			document.body.addClass(view);
		}
	});
}