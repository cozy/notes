should = require('should')
Tree = require('../lib/tree').Tree

tree = null
retrievedNode = null

describe "Tree tools", ->

    describe "Create new tree", ->
        it "When I create a new tree", ->
            tree = new Tree
        it "I have a tree with just one root", ->
            should.exist tree.all

    describe "Add a node", ->
        it "When I add a node called 'recipe'", ->
            tree.addNode "/all/recipe"
        it "And I add a node called 'todo'", ->
            tree.addNode "/all/todo"
        it "Then I have a property recipe and a property todo in my tree.", ->
            should.exist tree.all.recipe
            should.exist tree.all.todo
        it "When I add a node called '/all/recipe/dessert/brownie'", ->
            tree.addNode "/all/recipe/dessert/brownie"
        it "Then I have a property recipe.dessert.brownie in my tree.", ->
            should.exist tree.all.recipe.dessert.brownie

    describe "Get a node", ->
        it "When I get a node called 'todo'", ->
            retrievedNode = tree.getNode "todo"
        it "Then I have an empty object", ->
            should.exist retrievedNode
        it "When I get a node called '/all/recipe/dessert'", ->
            retrievedNode = tree.getNode "/all/recipe/dessert"
        it "Then I have an object with brownie as property", ->
            should.exist retrievedNode.brownie

    describe "Delete a node", ->
        it "When I delete a node called '/all/todo'", ->
            tree.deleteNode "/all/todo"
        it "Then node called '/all/todo' should not exist", ->
            should.not.exist tree.all.todo
        it "When I delete a node called '/all/recipe/dessert'", ->
            tree.deleteNode "/all/recipe/dessert"
        it "Then node called '/all/recipe/dessert' should not exist", ->
            should.not.exist tree.all.recipe.dessert
            should.exist tree.all.recipe

    describe "Update a node", ->
        it "When I update a node called '/all/recipe' with '/all/recipes/'", ->
            tree.addNode "/all/recipe/dessert"
            tree.updateNode "/all/recipe", "recipes"
        it "Then node called '/all/recipe' should not exist", ->
            should.not.exist tree.all.recipe
        it "And node called '/all/recipes/dessert' should exist", ->
            should.exist tree.all.recipes.dessert


