'use strict';
/**
 * baileys-buttons — send WhatsApp interactive buttons, lists and polls
 * with Baileys (WhiskeySockets), without modifying Baileys' source.
 *
 * Vendorizado desde https://github.com/meowguck-art/baileys-buttons (MIT).
 * Construye el mensaje interactivo con los nodos binarios que WhatsApp
 * exige (biz + interactive/native_flow) usando sock.relayMessage en vez
 * de sock.sendMessage — el formato "buttonsMessage/listMessage" viejo
 * que usa sendMessage ya no lo respeta WhatsApp y lo aplana a texto.
 */

const {
  generateWAMessageFromContent,
  proto,
} = require('@whiskeysockets/baileys');

function quickReply(id, displayText) {
  return {
    name: 'quick_reply',
    buttonParamsJson: JSON.stringify({ display_text: displayText, id }),
  };
}

function singleSelectButton(buttonTitle, sections) {
  return {
    name: 'single_select',
    buttonParamsJson: JSON.stringify({
      title: buttonTitle,
      sections: sections.map((s) => ({
        title: s.title || '',
        rows: s.rows.map((r) => ({
          id: r.id,
          title: r.title,
          description: r.description || '',
        })),
      })),
    }),
  };
}

function interactiveNodes(jid, ai = true) {
  const nodes = [
    {
      tag: 'biz',
      attrs: {},
      content: [
        {
          tag: 'interactive',
          attrs: { type: 'native_flow', v: '1' },
          content: [
            { tag: 'native_flow', attrs: { v: '9', name: 'mixed' } },
          ],
        },
      ],
    },
  ];
  if (ai && !String(jid).endsWith('@g.us')) {
    nodes.push({ tag: 'bot', attrs: { biz_bot: '1' } });
  }
  return nodes;
}

async function sendInteractive(sock, jid, { text, footer = '', title = '', buttons, quoted, ai = true } = {}) {
  if (!text) throw new Error('sendInteractive: text is required');
  if (!Array.isArray(buttons) || buttons.length === 0) {
    throw new Error('sendInteractive: buttons must be a non-empty array');
  }

  const msg = generateWAMessageFromContent(
    jid,
    {
      viewOnceMessage: {
        message: {
          messageContextInfo: { deviceListMetadata: {}, deviceListMetadataVersion: 2 },
          interactiveMessage: proto.Message.InteractiveMessage.create({
            header: proto.Message.InteractiveMessage.Header.create({ title, hasMediaAttachment: false }),
            body: proto.Message.InteractiveMessage.Body.create({ text }),
            footer: proto.Message.InteractiveMessage.Footer.create({ text: footer }),
            nativeFlowMessage: proto.Message.InteractiveMessage.NativeFlowMessage.create({ buttons }),
          }),
        },
      },
    },
    { quoted, userJid: sock.user?.id }
  );

  await sock.relayMessage(jid, msg.message, {
    messageId: msg.key.id,
    additionalNodes: interactiveNodes(jid, ai),
  });
  return msg.key;
}

async function sendButtons(sock, jid, { text, footer = '', title = '', buttons, quoted, ai = true } = {}) {
  if (!Array.isArray(buttons) || buttons.length === 0) throw new Error('sendButtons: buttons must be a non-empty array');
  if (buttons.length > 3) throw new Error('sendButtons: WhatsApp allows max 3 buttons per message');
  return sendInteractive(sock, jid, { text, footer, title, quoted, ai, buttons: buttons.map((b) => quickReply(b.id, b.displayText)) });
}

async function sendList(sock, jid, { text, footer = '', title = '', buttonText, sections, quoted, ai = true } = {}) {
  if (!buttonText) throw new Error('sendList: buttonText is required');
  if (!Array.isArray(sections) || sections.length === 0) throw new Error('sendList: sections must be a non-empty array');
  return sendInteractive(sock, jid, { text, footer, title, quoted, ai, buttons: [singleSelectButton(buttonText, sections)] });
}

function getButtonReplyId(message) {
  try {
    const r = message?.interactiveResponseMessage;
    if (!r) return null;
    const params = r?.nativeFlowResponseMessage?.paramsJson;
    if (params) return JSON.parse(params).id || null;
    return r?.singleSelectReply?.selectedRowId || null;
  } catch {
    return null;
  }
}

function getListReplyId(message) {
  try {
    return (
      message?.listResponseMessage?.singleSelectReply?.selectedRowId ||
      message?.interactiveResponseMessage?.singleSelectReply?.selectedRowId ||
      null
    );
  } catch {
    return null;
  }
}

module.exports = {
  sendInteractive, sendButtons, sendList,
  getButtonReplyId, getListReplyId,
  quickReply, singleSelectButton,
};
