base_url = http://65.2.127.123:3004

Avatar:
to post avatar {{base_url}}/avatar/post/avt
parameteres: 
    {
        avtname: String,
        avtpic: file(png,jpg,jpeg & less than 5mb)
    }

to get all avatar {{base_url}}/avatar/getAll/avt
to get one avatar by id {{base_url}}/avatar/getAvatar/:avatarId
to get one avatar by name {{base_url}}/avatar/getbyavtname/:avtname
to delete one avatar by id {{base_url}}/avatar/deleteAvatar/:avtid

Category:
to post category {{base_url}}/category/post/category
parameteres: 
    {
        name: String,
        photo: file(png,jpg,jpeg & less than 5mb)
    }

to get all category {{base_url}}/category/getAll/category
to get one category by id {{base_url}}/category/getonecategory/:categoryId
to delete one category by id {{base_url}}/category/deletecategory/:categoryid


Comment:
to post comment {{base_url}}/comment/post/comment
parameteres:
    {
    "userid" : "62457eac8ef7412cc5e4b1ae",
    "recipeid" : "624ad83674de14fc2111a2f8",
    "comment" : "comment avsgvmllm"
    }

to get one comment by id {{base_url}}/comment/getonecomment/:commentId
to get one comment by recipe id {{base_url}}/comment/getCommentRecipe/:recipeId
to delete one comment by id {{base_url}}/comment/deletecomment/:commentId


Ingredient:
to post Ingredient {{base_url}}/ingredient/post/ingredient
parameteres:
    {
    "name" : "300",
    "categoryId" : "62513f5d6136042f731313e4"
    }

to get(search) ingredient {{base_url}}/ingredient/search/ingredient/:name
to get one ingredient {{base_url}}/ingredient/get/oneingredient/:ingredientId
to get all ingredients {{base_url}}/ingredient/getAll/ingredient
to get one category's ingredients by id {{base_url}}/ingredient/getingredient/bycategory/:categoryId
to get all category's ingredients {{base_url}}/ingredient/getallingredient/byallcategory
to get filter list {{base_url}}/ingredient/filter/list
parameteres:
    {
    "dataarr":["6231a86fea2abf2081e3a489","6231b7155c6ce368ade53c47"]
    }

to delete ingredient by id {{base_url}}/ingredient/deleteingredient/:ingredientId


Playlist:
to post Playlist {{base_url}}/playlist/post/playlist
parameteres: 
    {
        name:chinese
        recipesid[]:622846b24d8630c580121934
        recipesid[1]:6231d0137cbefd27e7b8ec0f
        avtpic: file(png,jpg,jpeg & less than 5mb)
    }

to get all playlist {{base_url}}/playlist/get/AllPlaylist
to put(update) Playlist {{base_url}}/playlist/update/Playlist/:id
to delete playlist {{base_url}}/playlist/delete/Playlist/:id


Recipe:
to post recipe {{base_url}}/recipe/post/recipe/:userId
parameteres: 
    {
        rname: String,
        ulink: u tube link,
        desc: String,
        steps: array,
        ingre: array,
        ctime: String,
        playlist: playlistid,
        Rpic: (png,jpg,jpeg & less than 5mb)
    }

to get(search) recipe {{base_url}}/recipe/searchrecipe/:name
to get all recipes {{base_url}}/recipe/getall/recipes
to get one recipe {{base_url}}/recipe/getrecipe/:recipeId
to put(update) recipe {{base_url}}/recipe/update/recipe/:id
to delete recipe {{base_url}}/recipe/delete/recipe/:recipeId


favourite:
to post recipe in favourite {{base_url}}/recipe/addfavourite/:userId
parameteres: 
    {
    "recipeId" : "624d0e74b22c64e9bf8a0c22"
    }

to get favourite recipes {{base_url}}/recipe/getfavourite/:userid
to post(remove) from favourite {{base_url}}/recipe/removefavourite/:userId


User:
to signup user {{base_url}}/user/signup/user
parameteres: 
    {
        username:
        email:
        password:
    }

to signup user {{base_url}}/user/signin/user
to verify email {{base_url}}/user/verify/email
to logout {{base_url}}/user/logout/user
to patch(update) user {{base_url}}/user/update/user
to get user {{base_url}}/user/get/user
to get user by username {{base_url}}/user/get/byusername/:username
to delete user {{base_url}}/user/delete/user/:userId