
export const generateBoEmailHtml = (username: string, content: string) => {
    // Convert newlines to <br> for simple text content
    const formattedContent = content.replace(/\n/g, '<br/>')

    return `
<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Bo Restaurant Offer</title>
    <style>
        body { margin: 0; padding: 0; font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; background-color: #09090b; color: #ffffff; }
        .container { max-width: 600px; margin: 0 auto; background-color: #18181b; border-radius: 16px; overflow: hidden; margin-top: 40px; margin-bottom: 40px; border: 1px solid #27272a; }
        .header { background-color: #000000; padding: 30px; text-align: center; border-bottom: 1px solid #27272a; }
        .logo { font-size: 24px; font-weight: bold; color: #ffffff; letter-spacing: 2px; }
        .logo span { color: #eab308; } /* Yellow-500 */
        .content { padding: 40px; line-height: 1.6; color: #d4d4d8; font-size: 16px; }
        .cta-container { text-align: center; margin-top: 30px; }
        .button { display: inline-block; background-color: #ffffff; color: #000000; padding: 16px 32px; border-radius: 8px; font-weight: bold; text-decoration: none; font-size: 16px; margin-top: 20px; }
        .footer { background-color: #000000; padding: 20px; text-align: center; font-size: 12px; color: #71717a; border-top: 1px solid #27272a; }
        .highlight { color: #eab308; font-weight: bold; }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <div class="logo">BO <span>RESTAURANT</span></div>
        </div>
        <div class="content">
            <p>Hello ${username},</p>
            <p>${formattedContent}</p>
        </div>
        <div class="footer">
            <p>© ${new Date().getFullYear()} Bo Restaurant. All rights reserved.</p>
            <p>Vietnam flavors, modern vibes.</p>
        </div>
    </div>
</body>
</html>
`
}
