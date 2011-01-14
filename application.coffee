# _(members).each(function (m) { _(df).each(function(n) { if (n.guid == m) { n.member=true; Dreamfish.update(n, function(){}); } } ) } ) #
LOCAL = true
BASE_URL = "store.php"
CURRENT_USERNAME = ""
CURRENT_USERGUID = ""

ISODateString = (d) -> 
  pad = (n) -> 
    return if n<10 then '0'+n else n
  return d.getUTCFullYear()+'-'+ pad(d.getUTCMonth()+1)+'-'+ pad(d.getUTCDate())+'T'+ pad(d.getUTCHours())+':'+ pad(d.getUTCMinutes())+':'+ pad(d.getUTCSeconds())+'Z'
      
class Resource
   all: (callback) =>
        $.ajax {
            # url: "http://dreamfish.com/openkeyval/api/" + @KEY(),
            url: BASE_URL + '?key=' + @KEY()
            dataType: "json",
            success: (data) -> 
                if (typeof(col) == 'string')
                  col = JSON.parse(data)
                else
                  col = data
                col ?= []
                callback ( col );
        }
    remove: (guid, success) =>
        @all((links)=>      
            links = _.reject(links, (o)->return o.guid == guid)
            @save(links, success))

    saveDoc: (doc) =>
        json = JSON.stringify(doc);
        data = {}
        data[if LOCAL then "data" else doc.guid] = json;

        $.ajax {
            # url: if LOCAL then "http://dreamfish.com/openkeyval/api/" + doc.guid else "http://dreamfish.com/openkeyval/api/store/",
            url: BASE_URL + '?key=' + doc.guid,
            data: data,
            dataType: if LOCAL then "json" else "jsonp",
            type: if LOCAL then "post" else "get"                
        }

    save: (links, success) =>    
        links ?= []
        
        if typeof(@index_keys) == 'undefined'
            idx = _.map(links, (link)-> return { guid: link.guid, topic: link.topic, url: link.url, votes: link.votes, date:link.date })
        else
            idx = _.map(links, (link)=>
                @index_keys(link)
            )
        
        json = JSON.stringify(idx);
        data = {};
        data[if LOCAL then "data" else @KEY()] = json;

        $.ajax {
            # url: if LOCAL then "http://dreamfish.com/openkeyval/api/" + @KEY() else "http://dreamfish.com/openkeyval/api/store/",
            url: BASE_URL + '?key=' + @KEY(),
            data: data,
            dataType: if LOCAL then "json" else "jsonp",
            type: if LOCAL then "post" else "get",
            success: (data) =>
                success(links)
        }
      
    add: (link, success) =>
        link.guid = guid()
        @saveDoc(link)
        @all((links)=>      
            links.push(link)
            @save(links, success))
    
    update: (link, success) =>
        @saveDoc(link)
        @all((links)=>     
            links = _.reject(links, (o)->return o.guid == link.guid) 
            links.push(link)
            @save(links, success))

    get: (guid, success) =>
        $.ajax {
            # url: "http://dreamfish.com/openkeyval/api/" + guid,
            url: BASE_URL + '?key=' + guid
            dataType: "jsonp",
            success: (data) -> 
                row = JSON.parse(data)
                success( row );
        }

class Dreamfish extends Resource
    elgg: (callback) =>
      $.ajax {
            url: "http://www.dreamfish.com/mod/dreamfish_theme/[EXPORT URL]"
            dataType: "jsonp",
            success: (data) ->                     
                callback ( data );
        }
    sync: ->
        @elgg((elgg_users)=>          
            u = []
            @all((json_users) =>              
                _(elgg_users).each((elgg)=>
                    jusers = _.select(json_users,(json)->elgg.guid==json.guid)
                    if (jusers.length>0)
                      juser = jusers[0]
                      juser.date = elgg.date
                      juser.name = elgg.name
                      juser.email = elgg.email
                      juser.username = elgg.username
                      # @saveDoc(juser, ->)
                      u.push(juser)
                    else
                      # @saveDoc(elgg)
                      u.push(elgg)                                            
                )                
                @save(u, ->)
            )            
            
        )
    KEY: -> 'dreamfish_member'
    index_keys : (doc) ->
        return { guid: doc.guid, member:doc.member, name:doc.name, email:doc.email, date:doc.date, username:doc.username }

class Links extends Resource
    KEY: ->  'links_new'

class Activity extends Resource
  KEY: -> 'activity'
  index_keys : (doc) ->
    return { guid: doc.guid, activity:doc.activity, date:doc.date, username:doc.username, user_guid: doc.user_guid}

class Session extends Resource
  KEY: -> 'session'

applyStyles = () ->
  el =$('.ui-page-active .ui-content')
  el.find('ul[data-role]').listview();
  el.find('div[data-role="fieldcontain"]').fieldcontain();
  el.find('button[data-role="button"],a[data-role="button"]').button();
  el.find('input[type="text"]').textinput();
  el.find('.pretty-date').prettyDate()
  el.page()
  
class Link extends Backbone.Model

class LinkCollection extends Backbone.Collection
    model: Link
    url: "store.php?key=links_new"
    
LinksN = new LinkCollection()

class AddView extends Backbone.View
    constructor: -> 
        super
        @template = _.template('''
          <div data-role="fieldcontains">        
          <label>Topic: </label>
            <input type="text" id="topic"></input><br>
           <label>URL: </label>
            <input type="text" id="url"></input>
            <a href="" id="DiscussionAdd" data-role="button"   data-inline="true">Add</a>
          </div>
           <br>
            <ul data-role="listview">
            <% _.each(data, function(link) { %>
                     <li>
                        <h3><a href="<%=link.get('url')%>" rel="external"><%=link.get('topic')%></a></h3>                       
                        <p><a href='/delete/<%=link.get('guid')%>' class='delete' rel='<%=link.get('guid')%>'>delete</a>                         
                        <a href='/view/<%=link.get('guid')%>' class="vote" rel='<%=link.get('guid')%>'>vote</a>
                        <a href='/view/<%=link.get('guid')%>' class="vote2" rel='<%=link.get('guid')%>'>vote</a> 
                        </p>
                    </li> 
            <% }); %>
            </ul>
        ''')
        _.bindAll(this, 'refresh');
        LinksN.bind("refresh", @refresh);
        
    refresh: ->        
        el = $('.ui-page-active .ui-content')
        el.html(@template({data:_(LinksN.models).sortBy((d)->d.get('date')).reverse()}))
        el.find('#DiscussionAdd').click(->          
          new Links().add({url:$('#url').val(), date:ISODateString(new Date()), topic: $('#topic').val()}, -> 
            LinksN.fetch()
            LinksN.refresh()
          )
          return false)
         
         el.find('.delete').click(->
            new Links().remove($(this).attr('rel'),  -> 
              LinksN.fetch()
              LinksN.refresh())          
            return false)
        applyStyles()
        
class OtherView extends Backbone.View
    constructor: ->
        super        
        @template = _.template('''
            <h1>hi3</h1>
            <a href="add">add</a>
            blahblah
        ''')
        @render()
        
    render: ->
        el = $('#content')
        el.html(@template())
        applyStyles()

class MembersView extends Backbone.View
  constructor: -> 
    super
    @template = _.template('''
      <ul data-role="listview" data-filter="true" data-inset="true">
      <% _.each(data, function(u) { %>
      <li><a href="#user-<%=u.guid%>"><%=u.name%></a></li>
      <% }); %>
      </ul>
    ''')
    
  render: (data) ->    
    $('.ui-page-active .ui-content').html(@template({data: _(data).sortBy((d)->d.name)}))
    applyStyles()
  
  render_menu: ->
    $('.ui-page-active .ui-content').html('''
      <ul data-role="listview">
      <li><a href="#members-members">Members</a></li>
      <li><a href="#members-users">Users</a></li>
      <li><a href="#members-all">All</a></li>
      </ul>
    ''')
    applyStyles()
class IndexView extends Backbone.View
  render: ->    
    $('.ui-page-active .ui-content').html('''
    <div data-role="fieldcontains">        
        <label>What are you working on?</label>
        <input type="text" name="name" id="name" value=""  class="ui-input-text ui-body-null ui-corner-all ui-shadow-inset ui-body-c"/>
        <a id="Add" data-role="button"  data-inline="true">Add</a>
    </div>
    <br>
     <ul data-role="listview" data-inset="true">
      <li><a href="#activity">Activity</a></li>
      <li><a href="#discussion">Discussion</a></li>
      <li><a href="#members">Members</a></li>
      <li><a href="#projects">Projects</a></li>
      <li><a href="#requests">Requests</a></li>
      <li><a href="#tasks">Tasks</a></li>
    </ul>    
    ''')
    applyStyles()
    $('.ui-page-active .ui-content').find('#Add').click(=>
        new Activity().add({activity:$('#name').val(), date: ISODateString(new Date()), username:CURRENT_USERNAME, user_guid:CURRENT_USERGUID}, ->)
        $('#flash').text('activity saved');
        return false;
    )

class ActivityView extends Backbone.View
  constructor: -> 
    @template = _.template('''      
      <ul data-role="listview">
      <% _.each(data, function(u) { %>
        <li>
          <img src="http://www.dreamfish.com/mod/profile/icondirect.php?lastcache=1265999843&username=<%=u.username%>&size=medium">
          <h3><a href="#"><%=u.activity%></a></h3>
          <p class="pretty-date" title="<%=u.date%>"><%=u.date%></p>
        </li>
      <% }); %>
      </ul>
    ''')

  render: (data) ->     
    $('.ui-page-active .ui-content').html(@template({data: _(data).sortBy((d)->d.date).reverse()}))
    applyStyles()

class UserView extends Backbone.View
  constructor: -> 
    @template = _.template('''      
      <h1><%=data.name%></h1>
      <img src="http://www.dreamfish.com/mod/profile/icondirect.php?lastcache=1265999843&username=<%=data.username%>&size=large">
      <h2>Joined: <span class="pretty-date" title="<%=data.date%>"><%=data.date%></span></h2>
      Member: <%=data.member == true ? "Yes" : "No" %>
    ''')

  render: (data) ->     
    $('.ui-page-active .ui-content').html(@template({data: data}))
    applyStyles()

class NotYetView extends Backbone.View
  render: ->
    $('.ui-page-active .ui-content').html("<h1>not yet implemented</h1>")
    applyStyles()
    
class Workspace extends Backbone.Controller
    routes: 
        "add" : "add",
        "other" : "other",
        "discussion" : "add",
        "activity" : "activity",
        "members" : "members_menu",
        "members-members" : "members_members",
        "members-users" : "members_users",
        "members-all" : "members_all",
        "user-:id" : "user",
        "projects" : "notyet",
        "requests" : "notyet",
        "tasks" : "notyet"
        
    add: (name) ->
        LinksN.fetch()
        new AddView 
    other: () ->
        new OtherView()
    index: () ->
        new Session().all((d)->
            if d? and d.guid?
              $('#Welcome').html('<img src="http://www.dreamfish.com/mod/profile/icondirect.php?lastcache=1265999843&username=' + d.username  + '&size=small"> Welcome back ' + d['name'])
              CURRENT_USERNAME = d["username"]
              CURRENT_GUID = d["guid"]
            else
              $('#Welcome').html('Hello. Please log in at <a rel="external" href="http://www.dreamfish.com/pg/page/login/redir/mobile">Dreamfish</a> and then come back for the full experience</a>')
        )
        new IndexView().render()
    members_menu: () ->
      new MembersView().render_menu()
    members: () -> new Dreamfish().all((d)->new MembersView().render(d))
    members_members: () -> 
      new Dreamfish().all((d) -> 
        members = _(d).select((u)->u.member)
        new MembersView().render(members))
    members_users: () -> 
      new Dreamfish().all((d) -> 
        members = _(d).select((u)->
          u.member?=false
          return not u.member)
        new MembersView().render(members))
    members_all: () -> new Dreamfish().all((d)->new MembersView().render(d))
    activity: () ->      
      new Activity().all((d)->
        new ActivityView().render(d))
    user: (id) ->
      new Dreamfish().all((d)->
        user = _(d).select((u)->u.guid == id)[0]
        new UserView().render(user))
    notyet: ->
      new NotYetView().render()

$(document).ready ->      
  w = new Workspace()
  w.index()
  Backbone.history.start()

  window.Dreamfish = new Dreamfish()                 
