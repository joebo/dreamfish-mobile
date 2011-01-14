(function() {
  var Activity, ActivityView, AddView, BASE_URL, CURRENT_USERGUID, CURRENT_USERNAME, Dreamfish, ISODateString, IndexView, LOCAL, Link, LinkCollection, Links, LinksN, MembersView, NotYetView, OtherView, Resource, Session, UserView, Workspace, applyStyles;
  var __bind = function(func, context) {
    return function(){ return func.apply(context, arguments); };
  }, __extends = function(child, parent) {
    var ctor = function(){};
    ctor.prototype = parent.prototype;
    child.prototype = new ctor();
    child.prototype.constructor = child;
    if (typeof parent.extended === "function") parent.extended(child);
    child.__super__ = parent.prototype;
  };
  LOCAL = true;
  BASE_URL = "store.php";
  CURRENT_USERNAME = "";
  CURRENT_USERGUID = "";
  ISODateString = function(d) {
    var pad;
    pad = function(n) {
      return n < 10 ? '0' + n : n;
    };
    return d.getUTCFullYear() + '-' + pad(d.getUTCMonth() + 1) + '-' + pad(d.getUTCDate()) + 'T' + pad(d.getUTCHours()) + ':' + pad(d.getUTCMinutes()) + ':' + pad(d.getUTCSeconds()) + 'Z';
  };
  Resource = function() {
    var _this;
    _this = this;
    this.get = function(){ return Resource.prototype.get.apply(_this, arguments); };
    this.update = function(){ return Resource.prototype.update.apply(_this, arguments); };
    this.add = function(){ return Resource.prototype.add.apply(_this, arguments); };
    this.save = function(){ return Resource.prototype.save.apply(_this, arguments); };
    this.saveDoc = function(){ return Resource.prototype.saveDoc.apply(_this, arguments); };
    this.remove = function(){ return Resource.prototype.remove.apply(_this, arguments); };
    this.all = function(){ return Resource.prototype.all.apply(_this, arguments); };
    return this;
  };
  Resource.prototype.all = function(callback) {
    return $.ajax({
      url: BASE_URL + '?key=' + this.KEY(),
      dataType: "json",
      success: function(data) {
        var col;
        if (typeof (col) === 'string') {
          col = JSON.parse(data);
        } else {
          col = data;
        }
        col = (typeof col !== "undefined" && col !== null) ? col : [];
        return callback(col);
      }
    });
  };
  Resource.prototype.remove = function(guid, success) {
    return this.all(__bind(function(links) {
      links = _.reject(links, function(o) {
        return o.guid === guid;
      });
      return this.save(links, success);
    }, this));
  };
  Resource.prototype.saveDoc = function(doc) {
    var data, json;
    json = JSON.stringify(doc);
    data = {};
    data[LOCAL ? "data" : doc.guid] = json;
    return $.ajax({
      url: BASE_URL + '?key=' + doc.guid,
      data: data,
      dataType: LOCAL ? "json" : "jsonp",
      type: LOCAL ? "post" : "get"
    });
  };
  Resource.prototype.save = function(links, success) {
    var data, idx, json;
    links = (typeof links !== "undefined" && links !== null) ? links : [];
    if (typeof (this.index_keys) === 'undefined') {
      idx = _.map(links, function(link) {
        return {
          guid: link.guid,
          topic: link.topic,
          url: link.url,
          votes: link.votes,
          date: link.date
        };
      });
    } else {
      idx = _.map(links, __bind(function(link) {
        return this.index_keys(link);
      }, this));
    }
    json = JSON.stringify(idx);
    data = {};
    data[LOCAL ? "data" : this.KEY()] = json;
    return $.ajax({
      url: BASE_URL + '?key=' + this.KEY(),
      data: data,
      dataType: LOCAL ? "json" : "jsonp",
      type: LOCAL ? "post" : "get",
      success: __bind(function(data) {
        return success(links);
      }, this)
    });
  };
  Resource.prototype.add = function(link, success) {
    link.guid = guid();
    this.saveDoc(link);
    return this.all(__bind(function(links) {
      links.push(link);
      return this.save(links, success);
    }, this));
  };
  Resource.prototype.update = function(link, success) {
    this.saveDoc(link);
    return this.all(__bind(function(links) {
      links = _.reject(links, function(o) {
        return o.guid === link.guid;
      });
      links.push(link);
      return this.save(links, success);
    }, this));
  };
  Resource.prototype.get = function(guid, success) {
    return $.ajax({
      url: BASE_URL + '?key=' + guid,
      dataType: "jsonp",
      success: function(data) {
        var row;
        row = JSON.parse(data);
        return success(row);
      }
    });
  };
  Dreamfish = function() {
    var _this;
    _this = this;
    this.elgg = function(){ return Dreamfish.prototype.elgg.apply(_this, arguments); };
    return Resource.apply(this, arguments);
  };
  __extends(Dreamfish, Resource);
  Dreamfish.prototype.elgg = function(callback) {
    return $.ajax({
      url: "http://www.dreamfish.com/mod/dreamfish_theme/[EXPORT URL]",
      dataType: "jsonp",
      success: function(data) {
        return callback(data);
      }
    });
  };
  Dreamfish.prototype.sync = function() {
    return this.elgg(__bind(function(elgg_users) {
      var u;
      u = [];
      return this.all(__bind(function(json_users) {
        _(elgg_users).each(__bind(function(elgg) {
          var juser, jusers;
          jusers = _.select(json_users, function(json) {
            return elgg.guid === json.guid;
          });
          if (jusers.length > 0) {
            juser = jusers[0];
            juser.date = elgg.date;
            juser.name = elgg.name;
            juser.email = elgg.email;
            juser.username = elgg.username;
            return u.push(juser);
          } else {
            return u.push(elgg);
          }
        }, this));
        return this.save(u, function() {});
      }, this));
    }, this));
  };
  Dreamfish.prototype.KEY = function() {
    return 'dreamfish_member';
  };
  Dreamfish.prototype.index_keys = function(doc) {
    return {
      guid: doc.guid,
      member: doc.member,
      name: doc.name,
      email: doc.email,
      date: doc.date,
      username: doc.username
    };
  };
  Links = function() {
    return Resource.apply(this, arguments);
  };
  __extends(Links, Resource);
  Links.prototype.KEY = function() {
    return 'links_new';
  };
  Activity = function() {
    return Resource.apply(this, arguments);
  };
  __extends(Activity, Resource);
  Activity.prototype.KEY = function() {
    return 'activity';
  };
  Activity.prototype.index_keys = function(doc) {
    return {
      guid: doc.guid,
      activity: doc.activity,
      date: doc.date,
      username: doc.username,
      user_guid: doc.user_guid
    };
  };
  Session = function() {
    return Resource.apply(this, arguments);
  };
  __extends(Session, Resource);
  Session.prototype.KEY = function() {
    return 'session';
  };
  applyStyles = function() {
    var el;
    el = $('.ui-page-active .ui-content');
    el.find('ul[data-role]').listview();
    el.find('div[data-role="fieldcontain"]').fieldcontain();
    el.find('button[data-role="button"],a[data-role="button"]').button();
    el.find('input[type="text"]').textinput();
    el.find('.pretty-date').prettyDate();
    return el.page();
  };
  Link = function() {
    return Backbone.Model.apply(this, arguments);
  };
  __extends(Link, Backbone.Model);
  LinkCollection = function() {
    return Backbone.Collection.apply(this, arguments);
  };
  __extends(LinkCollection, Backbone.Collection);
  LinkCollection.prototype.model = Link;
  LinkCollection.prototype.url = "store.php?key=links_new";
  LinksN = new LinkCollection();
  AddView = function() {
    AddView.__super__.constructor.apply(this, arguments);
    this.template = _.template('<div data-role="fieldcontains">        \n<label>Topic: </label>\n  <input type="text" id="topic"></input><br>\n <label>URL: </label>\n  <input type="text" id="url"></input>\n  <a href="" id="DiscussionAdd" data-role="button"   data-inline="true">Add</a>\n</div>\n <br>\n  <ul data-role="listview">\n  <% _.each(data, function(link) { %>\n           <li>\n              <h3><a href="<%=link.get(\'url\')%>" rel="external"><%=link.get(\'topic\')%></a></h3>                       \n              <p><a href=\'/delete/<%=link.get(\'guid\')%>\' class=\'delete\' rel=\'<%=link.get(\'guid\')%>\'>delete</a>                         \n              <a href=\'/view/<%=link.get(\'guid\')%>\' class="vote" rel=\'<%=link.get(\'guid\')%>\'>vote</a>\n              <a href=\'/view/<%=link.get(\'guid\')%>\' class="vote2" rel=\'<%=link.get(\'guid\')%>\'>vote</a> \n              </p>\n          </li> \n  <% }); %>\n  </ul>');
    _.bindAll(this, 'refresh');
    LinksN.bind("refresh", this.refresh);
    return this;
  };
  __extends(AddView, Backbone.View);
  AddView.prototype.refresh = function() {
    var el;
    el = $('.ui-page-active .ui-content');
    el.html(this.template({
      data: _(LinksN.models).sortBy(function(d) {
        return d.get('date');
      }).reverse()
    }));
    el.find('#DiscussionAdd').click(function() {
      new Links().add({
        url: $('#url').val(),
        date: ISODateString(new Date()),
        topic: $('#topic').val()
      }, function() {
        LinksN.fetch();
        return LinksN.refresh();
      });
      return false;
    });
    el.find('.delete').click(function() {
      new Links().remove($(this).attr('rel'), function() {
        LinksN.fetch();
        return LinksN.refresh();
      });
      return false;
    });
    return applyStyles();
  };
  OtherView = function() {
    OtherView.__super__.constructor.apply(this, arguments);
    this.template = _.template('<h1>hi3</h1>\n<a href="add">add</a>\nblahblah');
    this.render();
    return this;
  };
  __extends(OtherView, Backbone.View);
  OtherView.prototype.render = function() {
    var el;
    el = $('#content');
    el.html(this.template());
    return applyStyles();
  };
  MembersView = function() {
    MembersView.__super__.constructor.apply(this, arguments);
    this.template = _.template('<ul data-role="listview" data-filter="true" data-inset="true">\n<% _.each(data, function(u) { %>\n<li><a href="#user-<%=u.guid%>"><%=u.name%></a></li>\n<% }); %>\n</ul>');
    return this;
  };
  __extends(MembersView, Backbone.View);
  MembersView.prototype.render = function(data) {
    $('.ui-page-active .ui-content').html(this.template({
      data: _(data).sortBy(function(d) {
        return d.name;
      })
    }));
    return applyStyles();
  };
  MembersView.prototype.render_menu = function() {
    $('.ui-page-active .ui-content').html('<ul data-role="listview">\n<li><a href="#members-members">Members</a></li>\n<li><a href="#members-users">Users</a></li>\n<li><a href="#members-all">All</a></li>\n</ul>');
    return applyStyles();
  };
  IndexView = function() {
    return Backbone.View.apply(this, arguments);
  };
  __extends(IndexView, Backbone.View);
  IndexView.prototype.render = function() {
    $('.ui-page-active .ui-content').html('<div data-role="fieldcontains">        \n    <label>What are you working on?</label>\n    <input type="text" name="name" id="name" value=""  class="ui-input-text ui-body-null ui-corner-all ui-shadow-inset ui-body-c"/>\n    <a id="Add" data-role="button"  data-inline="true">Add</a>\n</div>\n<br>\n <ul data-role="listview" data-inset="true">\n  <li><a href="#activity">Activity</a></li>\n  <li><a href="#discussion">Discussion</a></li>\n  <li><a href="#members">Members</a></li>\n  <li><a href="#projects">Projects</a></li>\n  <li><a href="#requests">Requests</a></li>\n  <li><a href="#tasks">Tasks</a></li>\n</ul>    ');
    applyStyles();
    return $('.ui-page-active .ui-content').find('#Add').click(__bind(function() {
      new Activity().add({
        activity: $('#name').val(),
        date: ISODateString(new Date()),
        username: CURRENT_USERNAME,
        user_guid: CURRENT_USERGUID
      }, function() {});
      $('#flash').text('activity saved');
      return false;
    }, this));
  };
  ActivityView = function() {
    this.template = _.template('<ul data-role="listview">\n<% _.each(data, function(u) { %>\n  <li>\n    <img src="http://www.dreamfish.com/mod/profile/icondirect.php?lastcache=1265999843&username=<%=u.username%>&size=medium">\n    <h3><a href="#"><%=u.activity%></a></h3>\n    <p class="pretty-date" title="<%=u.date%>"><%=u.date%></p>\n  </li>\n<% }); %>\n</ul>');
    return this;
  };
  __extends(ActivityView, Backbone.View);
  ActivityView.prototype.render = function(data) {
    $('.ui-page-active .ui-content').html(this.template({
      data: _(data).sortBy(function(d) {
        return d.date;
      }).reverse()
    }));
    return applyStyles();
  };
  UserView = function() {
    this.template = _.template('<h1><%=data.name%></h1>\n<img src="http://www.dreamfish.com/mod/profile/icondirect.php?lastcache=1265999843&username=<%=data.username%>&size=large">\n<h2>Joined: <span class="pretty-date" title="<%=data.date%>"><%=data.date%></span></h2>\nMember: <%=data.member == true ? "Yes" : "No" %>');
    return this;
  };
  __extends(UserView, Backbone.View);
  UserView.prototype.render = function(data) {
    $('.ui-page-active .ui-content').html(this.template({
      data: data
    }));
    return applyStyles();
  };
  NotYetView = function() {
    return Backbone.View.apply(this, arguments);
  };
  __extends(NotYetView, Backbone.View);
  NotYetView.prototype.render = function() {
    $('.ui-page-active .ui-content').html("<h1>not yet implemented</h1>");
    return applyStyles();
  };
  Workspace = function() {
    return Backbone.Controller.apply(this, arguments);
  };
  __extends(Workspace, Backbone.Controller);
  Workspace.prototype.routes = {
    "add": "add",
    "other": "other",
    "discussion": "add",
    "activity": "activity",
    "members": "members_menu",
    "members-members": "members_members",
    "members-users": "members_users",
    "members-all": "members_all",
    "user-:id": "user",
    "projects": "notyet",
    "requests": "notyet",
    "tasks": "notyet"
  };
  Workspace.prototype.add = function(name) {
    LinksN.fetch();
    return new AddView();
  };
  Workspace.prototype.other = function() {
    return new OtherView();
  };
  Workspace.prototype.index = function() {
    new Session().all(function(d) {
      var CURRENT_GUID, _ref;
      if ((typeof d !== "undefined" && d !== null) && (typeof (_ref = d.guid) !== "undefined" && _ref !== null)) {
        $('#Welcome').html('<img src="http://www.dreamfish.com/mod/profile/icondirect.php?lastcache=1265999843&username=' + d.username + '&size=small"> Welcome back ' + d['name']);
        CURRENT_USERNAME = d["username"];
        return (CURRENT_GUID = d["guid"]);
      } else {
        return $('#Welcome').html('Hello. Please log in at <a rel="external" href="http://www.dreamfish.com/pg/page/login/redir/mobile">Dreamfish</a> and then come back for the full experience</a>');
      }
    });
    return new IndexView().render();
  };
  Workspace.prototype.members_menu = function() {
    return new MembersView().render_menu();
  };
  Workspace.prototype.members = function() {
    return new Dreamfish().all(function(d) {
      return new MembersView().render(d);
    });
  };
  Workspace.prototype.members_members = function() {
    return new Dreamfish().all(function(d) {
      var members;
      members = _(d).select(function(u) {
        return u.member;
      });
      return new MembersView().render(members);
    });
  };
  Workspace.prototype.members_users = function() {
    return new Dreamfish().all(function(d) {
      var members;
      members = _(d).select(function(u) {
        u.member = (typeof u.member !== "undefined" && u.member !== null) ? u.member : false;
        return !u.member;
      });
      return new MembersView().render(members);
    });
  };
  Workspace.prototype.members_all = function() {
    return new Dreamfish().all(function(d) {
      return new MembersView().render(d);
    });
  };
  Workspace.prototype.activity = function() {
    return new Activity().all(function(d) {
      return new ActivityView().render(d);
    });
  };
  Workspace.prototype.user = function(id) {
    return new Dreamfish().all(function(d) {
      var user;
      user = _(d).select(function(u) {
        return u.guid === id;
      })[0];
      return new UserView().render(user);
    });
  };
  Workspace.prototype.notyet = function() {
    return new NotYetView().render();
  };
  $(document).ready(function() {
    var w;
    w = new Workspace();
    w.index();
    Backbone.history.start();
    return (window.Dreamfish = new Dreamfish());
  });
}).call(this);
