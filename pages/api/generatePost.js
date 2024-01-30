import { getSession, withApiAuthRequired } from '@auth0/nextjs-auth0';
import { Configuration, OpenAIApi } from 'openai';
import clientPromise from '../../lib/mongodb';

export default withApiAuthRequired(async function handler(req, res) {
  const { user } = await getSession(req, res);
  const client = await clientPromise;
  const db = client.db("BlogStandard");
  const userProfile = await db.collection('users').findOne({
    auth0Id: user.sub
  });

  if (!userProfile?.availableTokens) {
    res.status(403);
    return;
  }

  const config = new Configuration({
    apiKey: process.env.OPENAI_API_KEY,
  });

  const openai = new OpenAIApi(config);

  const { topic, keywords } = req.body;

  if (!topic || !keywords) {
    res.status(422);
    return;
  }

  if (topic.length > 80 || keywords.length > 80) {
    res.status(422);
    return;
  }

  try {
    const postContentResult = await openai.createChatCompletion({
      model: 'gpt-3.5-turbo-1106',
      messages: [
        {
          role: 'system',
          content: 'You are an SEO friendly blog post generator called BlogStandard. You are designed to output markdown without frontmatter',
        },
        {
          role: 'user',
          content: `Generate me a long and detailed seo friendly blog post on the following topic: ${topic} delimited by triple hyphens:
            ---
            ${topic}
            ---
            Targeting the following comma separated keywords delimited by triple hyphens:
            ---
            ${keywords}
            ---
          `,
        },
      ],
      temperature: 0,
    });
  
    const postContent = postContentResult.data.choices[0]?.message.content;
  
    const titleResult = await openai.createChatCompletion({
      model: 'gpt-3.5-turbo',
      messages: [
        {
          role: 'system',
          content: 'You are an SEO friendly blog post generator called BlogStandard. You are designed to output markdown without frontmatter',
        },
        {
          role: 'user',
          content: `Generate me a long and detailed seo friendly blog post on the following topic: ${topic} delimited by triple hyphens:
            ---
            ${topic}
            ---
            Targeting the following comma separated keywords delimited by triple hyphens:
            ---
            ${keywords}
            ---
          `,
        },
        {
          role: 'assistant',
          content: postContent,
        },
        {
          role: 'user',
          content: 'Generate appropriate title tag text for the above blog post',
        },
      ],
      temperature: 0,
    });
  
    const metaDescriptionResult = await openai.createChatCompletion({
      model: 'gpt-3.5-turbo',
      messages: [
        {
          role: 'system',
          content: 'You are an SEO friendly blog post generator called BlogStandard. You are designed to output markdown without frontmatter',
        },
        {
          role: 'user',
          content: `Generate me a long and detailed seo friendly blog post on the following topic: ${topic} delimited by triple hyphens:
            ---
            ${topic}
            ---
            Targeting the following comma separated keywords delimited by triple hyphens:
            ---
            ${keywords}
            ---
          `,
        },
        {
          role: 'assistant',
          content: postContent,
        },
        {
          role: 'user',
          content:
            'Generate SEO-friendly meta description content for the above blog post',
        },
      ],
      temperature: 0,
    });
  
    const title = titleResult.data.choices[0]?.message.content;
    const metaDescription =
      metaDescriptionResult.data.choices[0]?.message.content;  

    await db.collection("users").updateOne({
      auth0Id: user.sub
    }, {
      $inc: {
        availableTokens: -1
      }
    });

    const post = await db.collection("posts").insertOne({
      title,
      postContent,
      metaDescription,
      topic,
      keywords,
      userId: userProfile._id,
      created: new Date()
    });

    res.status(200).json({ postId: post.insertedId });
  } catch (error) {
    console.error("Error during API call:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
})