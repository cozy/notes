# [Cozy](https://cozy.io) Notes

Cozy Notes makes your note management easy. Main features are: 

* Structured notes
* Note search
* File attachment
* Todo-list
* Contact linking

## Install

We assume here that the Cozy platform is correctly [installed](https://docs.cozy.io/en/host/install)
 on your server.

You can simply install the Notes application via the app registry. Click on ythe *Chose Your Apps* button located on the right of your Cozy Home.

From the command line you can type this command:

    cozy-monitor install notes


## Contribution

You can contribute to the Cozy Notes in many ways:

* Pick up an [issue](https://github.com/cozy/cozy-notes/issues?state=open) and solve it.
* Translate it in [a new language](https://github.com/cozy/cozy-notes/tree/master/client/app/locales).
* Note tagging
* Note sharing
* Collaboration writing


## Hack

Hacking the Notes app requires you [setup a dev environment](https://docs.cozy.io/hack/getting-started/). Once it's done you can hack Cozy Notes just like it was your own app.

    git clone https://github.com/cozy/cozy-notes.git

Run it with:

    node server.js

Each modification of the server coffee files requires them to be compiled into JS, here's
how to do it:

    cake convert

Each modification of the client requires a specific build too.

    cd client
    brunch build

## Tests

![Build Status](https://travis-ci.org/cozy/cozy-notes.png?branch=master)

To run tests type the following command into the Cozy Notes folder:

    cake tests

In order to run the tests, you must only have the Data System started.

## Icons

Main icon by [Elegant Themes](http://www.elegantthemes.com/blog/freebie-of-the-week/beautiful-flat-icons-for-free).

## License

Cozy Notes is developed by Cozy Cloud and distributed under the AGPL v3 license.

## What is Cozy?

![Cozy Logo](https://raw.github.com/cozy/cozy-setup/gh-pages/assets/images/happycloud.png)

[Cozy](https://cozy.io) is a platform that brings all your web services in the
same private space.  With it, your web apps and your devices can share data
easily, providing you
with a new experience. You can install Cozy on your own hardware where no one
profiles you.

## Community

You can reach the Cozy Community by:

* Chatting with us on IRC #cozycloud on irc.freenode.net
* Posting on our [Forum](https://forum.cozy.io)
* Posting issues on the [Github repos](https://github.com/cozy/)
* Mentioning us on [Twitter](https://twitter.com/mycozycloud)
