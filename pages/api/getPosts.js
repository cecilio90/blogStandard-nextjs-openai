import clientPromise from "../../lib/mongodb";
import { getSession, withApiAuthRequired } from "@auth0/nextjs-auth0"

export default withApiAuthRequired(async function handler(req, res) {
  const userSession = await getSession(req, res);
  const client = await clientPromise;
  const db = client.db("BlogStandard");
  const user = await db.collection('users').findOne({
    auth0Id: userSession.user.sub
  });
  
  const { lastPostDate, getNewerPosts } = req.body;

  const posts = await db.collection("posts").find({
    userId: user._id,
    created: {
      [getNewerPosts ? "$gt" : "$lt"]: new Date(lastPostDate)
    }
  })
  .limit(getNewerPosts ? 0 : 3)
  .sort({ created: -1 })
  .toArray();

  res.status(200).json({ posts });
})