const express = require('express');
const router = express.Router();
const User = require('../schemas/user');
const Score = require('../schemas/score');
const bcrypt = require('bcrypt');

const saltRounds = 10;

function checkPointCount(points) {
    var reward = -1;
    if (points % 500 == 0) {
        reward = 250;
    }
    else if (points % 100 == 0) {
        reward = 40;
    } else if (points % 10 == 0) {
        reward = 5;
    }

    return reward;
}
async function checkUser(givenParameters) {
    var findUser = '';
    if (givenParameters.password == null) {
        const findUsers = await User.find({
            username: givenParameters.username,
            cookies: givenParameters.cookie
        })
        findUser = findUsers;
        if(findUser.length == 1)
        {
            return findUser[0];
        }
        else
        {
            return null;
        }
    }
    else {
        const findUsers = await User.find({
            username: givenParameters.username
        });
        findUser = findUsers;
        if (findUser.length == 1) {
            if (bcrypt.compareSync(givenParameters.password, findUser[0].password)) {
                return findUser[0];
            }
            else {
                return null;
            }
        }
        else {
            return null;
        }
    }

}
function requestToObject(request) {
    var userName = request.body.userName;
    var cookie = request.body.cookie;
    var password = request.body.password;
    var queryData = {
        "username": userName,
        "cookie": cookie
    };
    password == undefined || null ? queryData["password"] = null : queryData["password"] = password;
    return queryData;
}
function generateHash() {
    return Math.random().toString(36).slice(-8);
}


router.post('/buttonClicked', async function (req, res) {
    try {
        var queryData = requestToObject(req);
        var givenUser = await checkUser(queryData);
        var currentScore = 0;
        var requestComplete = false;
        if (givenUser != null) {
            if (givenUser.points > 0) {
                const score = await Score.find();
                
                if (score.length == 0) {
                    const newScore = await new Score({
                        points: 1
                    });
                    await newScore.save();
                    currentScore = 1;
                }
                else {
                    console.log("Current Score: " + score[0].points + "\n");
                    currentScore = score[0].points;
                    await Score.updateOne(
                        { _id: score[0]._id },
                        { $set: { points: (score[0].points + 1) } }
                    );
                }
                var point = givenUser.points;
                var clicksUntilWin = 10 - currentScore % 10;
                var reward = checkPointCount(currentScore);
                point += reward;
                if (point <= 0) {
                    point = 0;
                }
                console.log( "user: " + givenUser.username + "\n" + "points: " + point + "\n");
                await User.updateOne(
                    { _id: givenUser._id },
                    {
                        $set: { points: point }
                    });
            }
            var returnUser = await checkUser(queryData);
            if (returnUser != null) {
                var jsonData = {
                    "username": returnUser.username,
                    "cookie": returnUser.cookies,
                    "points": returnUser.points,
                    "reward": reward,
                    "clicksUntilWin": clicksUntilWin
                };
                res.json(jsonData);
                res.end();
                requestComplete = true;
            }
        }
        if (!requestComplete) {
            res.json({ "data": "failed" });
            res.end();
        }
    }

    catch (err) {
        console.log(err);
        res.statusCode = 404;
    }
})

router.post('/resetPoints', async function (req, res) {
    var queryData = requestToObject(req);
    var givenUser = await checkUser(queryData);
    if (givenUser != null) {
        await User.updateOne(
            { _id: givenUser._id },
            {
                $set: { points: 20 }
            });
        var returnUser = await checkUser(queryData);
        if (returnUser != null) {
            var jsonData = {
                "username": returnUser.username,
                "cookie": returnUser.cookies,
                "points": returnUser.points
            };
            res.json(jsonData);
            res.end();
        }
    }
})

router.post('/registerUser', async function (req, res) {
    var userName = req.body.userName;
    var password = req.body.password;
    var cookie = req.body.cookie;
    var newUsername = req.body.newUserName;
    var queryData = {
        "username": userName == null ? "" : userName,
        "password": password
    };
    cookie == undefined ? queryData["cookie"] = null : queryData["cookie"] = cookie;

    const findUsers = await User.find({
        username: queryData.username,
        cookies: queryData.cookie
    });
    var givenUser = findUsers.length == 1 ? findUsers[0] : null;
    if (givenUser != null) {
        let hashedPassword = bcrypt.hashSync(queryData.password,saltRounds);
        await User.updateOne(
            { _id: givenUser._id },
            {
                $set: {
                    password: hashedPassword,
                    username: newUsername
                }
            });
        res.json({
            "username": newUsername,
            "cookie": givenUser.cookies,
            "points": givenUser.points
        });
        res.end();

    }
    else {
        let hashedPassword = bcrypt.hashSync(queryData.password,saltRounds);
        const user = await new User({
            username: newUsername,
            cookies: generateHash(),
            points: 20,
            password: hashedPassword
        })
        try {
            await user.save();
            console.log("user has been saved!");
            res.json({
                "username": user.username,
                "cookie": user.cookies,
                "points": user.points
            });
            res.end();
        }
        catch (err) {
            console.log(err);
            res.statusCode = 404;
            res.end();
        }
    }

})

router.get('/leaderboard', async function (req, res) {
    const users = await User.find().sort({ 'points': -1 }).limit(10);
    var userList = [];
    for (var i = 0; i < users.length; i++) {
        userList.push({
            "user": users[i].username,
            "score": users[i].points
        });
    }
    res.json(userList);
    res.end();


})

router.post('/checkIfUserExists', async function (req, res) {
    var userName = req.body.username;
    var userFound = await User.find({
        username: userName
    })
    res.json({ "user": !(userFound.length > 0) })
    res.end();

})

router.post('/checkUser', async function (req, res) {
    try {
        var queryData = requestToObject(req);
        var checkingUser = await checkUser(queryData);
        if (checkingUser != null) {
            var jsonData = {
                "username": checkingUser.username,
                "cookie": checkingUser.cookies,
                "points": checkingUser.points
            };
            res.json(jsonData);
            res.end();
        }
        else {
            res.json({ "data": "failed" });
            res.end();
        }

    }
    catch (err) {
        console.log(err);
        res.statusCode = 404;
    }
});

router.post('/createUser', async function (req, res) {
    var userHash = generateHash();
    const user = await new User({
        username: req.body.name,
        cookies: userHash,
        points: 20
    });
    try {
        await user.save();
        console.log("user has been saved!");
        res.json({ "username": req.body.name, "cookie": userHash, "points": 20 });
        res.end();
    }
    catch (err) {
        console.log(err);
        res.statusCode = 400;
    }
})





/* Debugging */
router.get('/deleteAll', async function (req, res) {
    try {
        res.json({ "users": "deleted" });
        res.end();
    }
    catch (err) {
        console.log(err);
    }
});
router.get('/all', async function (req, res) {
    try {
        const users = await User.find();
        console.log("Getting All Users");
        res.json(users);
        res.end();
    }
    catch (err) {
        console.log(err);
    }
});




module.exports = router;