
import { TenantConfig } from '@/app/lib/config/tenant';

export const EmailTemplates = {
  orderConfirmation: (order: any, config: TenantConfig) => {
    const brandColor = config.theme.primaryColor;
    const brandName = config.brand.name;
    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || '';

    const itemsList = order.items.map((item: any) => `
      <tr>
        <td style="padding: 10px; border-bottom: 1px solid #333;">${item.name} <span style="font-size: 12px; color: #888;">x${item.quantity}</span></td>
        <td style="padding: 10px; border-bottom: 1px solid #333; text-align: right;">${item.price}</td>
      </tr>
    `).join('')

    return `
      <div style="font-family: sans-serif; background-color: #000; color: #fff; padding: 20px;">
        <h1 style="color: ${brandColor};">Order Confirmed! 🍜</h1>
        <p>Hi there! Thanks for ordering from ${brandName}.</p>
        
        <div style="background-color: #111; padding: 20px; border-radius: 10px; margin: 20px 0;">
          <h2 style="margin-top: 0;">Order Details</h2>
          <table style="width: 100%; border-collapse: collapse;">
            ${itemsList}
          </table>
          <div style="margin-top: 20px; text-align: right; font-size: 18px; font-weight: bold;">
            Total: ${order.total}
          </div>
        </div>

        ${order.type === 'delivery' ? `
          <div style="margin-bottom: 20px;">
            <strong>Delivery Address:</strong><br/>
            ${order.address}<br/>
            ${order.apartment ? `Apt: ${order.apartment}` : ''}
          </div>
        ` : '<p><strong>Pickup Order</strong></p>'}

        <p style="color: #888; font-size: 12px;">
          If you have any questions, reply to this email or contact us via WhatsApp.
        </p>
      </div>
    `
  },

  bookingConfirmation: (booking: any, config: TenantConfig) => {
    const brandColor = config.theme.primaryColor;
    const brandName = config.brand.name;

    return `
      <div style="font-family: sans-serif; background-color: #000; color: #fff; padding: 20px;">
        <h1 style="color: ${brandColor};">Table Reserved! 🗓️</h1>
        <p>Hi ${booking.name}, your table request has been received.</p>
        
        <div style="background-color: #111; padding: 20px; border-radius: 10px; margin: 20px 0;">
          <p><strong>Date:</strong> ${booking.date}</p>
          <p><strong>Time:</strong> ${booking.time}</p>
          <p><strong>Guests:</strong> ${booking.guests}</p>
        </div>

        <p>We will contact you shortly to confirm availability.</p>
        
        <p style="color: #888; font-size: 12px;">
          ${brandName} Team
        </p>
      </div>
    `
  },

  marketingPromo: (segment: string, config: TenantConfig) => {
    const brandName = config.brand.name;
    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || '';

    let content = ''
    if (segment === 'spicy') {
      content = `
            <h1 style="color: #ef4444;">Craving something special? 🌶️</h1>
            <p>We noticed you love our spicy dishes. Come try our latest signatures!</p>
            <a href="${baseUrl}" style="display: inline-block; background-color: #ef4444; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px; margin-top: 10px;">View Menu</a>
          `
    } else {
      content = `
            <h1 style="color: #22c55e;">Fresh & Seasonal 🌱</h1>
            <p>Looking for a light experience? Our seasonal specials are waiting for you.</p>
            <a href="${baseUrl}" style="display: inline-block; background-color: #22c55e; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px; margin-top: 10px;">Order Now</a>
          `
    }

    return `
        <div style="font-family: sans-serif; background-color: #000; color: #fff; padding: 20px; text-align: center;">
            ${content}
            <p style="margin-top: 30px; color: #666; font-size: 12px;">Unsubscribe managed by ${brandName} Team.</p>
        </div>
      `
  },

  quizCoupon: (code: string, config: TenantConfig) => {
    const brandColor = config.theme.primaryColor;
    const brandName = config.brand.name;
    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || '';

    return `
      <div style="font-family: sans-serif; background-color: #000; color: #fff; padding: 20px; text-align: center;">
        <h1 style="color: ${brandColor};">You've Unlocked 10% Off! 🎁</h1>
        <p>Thanks for taking the ${brandName} Vibe Check.</p>
        
        <div style="background-color: #111; padding: 30px; border: 2px dashed ${brandColor}; border-radius: 10px; margin: 30px 0; display: inline-block;">
          <span style="display: block; color: #888; font-size: 14px; margin-bottom: 5px;">Your Promo Code:</span>
          <span style="font-size: 32px; font-weight: bold; letter-spacing: 2px; color: #fff;">${code}</span>
        </div>

        <p>Show this email to our staff or use it for your next online order.</p>
        
        <a href="${baseUrl}" style="display: inline-block; background-color: ${brandColor}; color: #000; padding: 12px 24px; text-decoration: none; border-radius: 8px; font-weight: bold; margin-top: 20px;">Order Now</a>
        
        <p style="margin-top: 40px; color: #666; font-size: 12px;">Valid for 7 days. One use per customer.</p>
      </div>
    `
  },

  reviewRequest: (name: string, config: TenantConfig) => {
    const brandColor = config.theme.primaryColor;
    const brandName = config.brand.name;

    return `
      <div style="font-family: sans-serif; background-color: #000; color: #fff; padding: 20px; text-align: center;">
        <h1 style="color: ${brandColor};">How was it, ${name}? ⭐</h1>
        <p>We hope you enjoyed your experience at ${brandName}!</p>
        <p>Your opinion helps us get better.</p>
        
        <div style="margin: 30px 0;">
            <a href="${config.contact.googleMapsLink}" style="background-color: #333; color: white; padding: 15px 30px; text-decoration: none; border-radius: 30px; border: 1px solid #555; font-weight: bold;">Leave a Review & Get a Gift 🎁</a>
        </div>

        <p style="color: #888; font-size: 12px;">Just show your review screenshot next time you visit!</p>
      </div>
    `
  },

  birthday: (name: string, config: TenantConfig) => {
    const brandColor = config.theme.primaryColor;
    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || '';

    return `
      <div style="font-family: sans-serif; background-color: #000; color: #fff; padding: 20px; text-align: center;">
        <h1 style="color: ${brandColor};">Happy Birthday, ${name}! 🎂</h1>
        <p>It's your special day, and we want to celebrate with you.</p>
        
        <div style="background-color: #111; padding: 30px; border: 2px solid ${brandColor}; border-radius: 10px; margin: 30px 0;">
             <h2 style="color: #fff; margin: 0;">SPECIAL BIRTHDAY OFFER</h2>
             <p style="color: #888; margin-top: 10px;">Valid today only!</p>
        </div>

        <a href="${baseUrl}/book" style="display: inline-block; background-color: ${brandColor}; color: #000; padding: 12px 24px; text-decoration: none; border-radius: 8px; font-weight: bold;">Book Your Table</a>
      </div>
    `
  },

  winBack: (name: string, config: TenantConfig) => {
    const brandColor = config.theme.primaryColor;
    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || '';

    return `
      <div style="font-family: sans-serif; background-color: #000; color: #fff; padding: 20px; text-align: center;">
        <h1 style="color: ${brandColor};">We Miss You, ${name} 🥺</h1>
        <p>It's been a while since we've seen you. We have some new surprises for you!</p>
        
        <p>Here's a little reason to come back:</p>
        
        <div style="background-color: #111; padding: 20px; margin: 20px 0; border-radius: 10px;">
            <span style="color: #38bdf8; font-weight: bold; font-size: 20px;">SPECIAL COMPLIMENT ON US 🍹</span>
        </div>

        <a href="${baseUrl}" style="display: inline-block; background-color: #38bdf8; color: #000; padding: 12px 24px; text-decoration: none; border-radius: 8px; font-weight: bold;">Visit Us Now</a>
      </div>
    `
  }
}


