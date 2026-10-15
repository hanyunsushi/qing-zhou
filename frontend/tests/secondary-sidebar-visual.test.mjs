import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import test from 'node:test';

const frontendRoot = new URL('..', import.meta.url);

/**
 * 二级侧边栏视觉验证：CSS 几何与参考组件一致性
 *
 * 参考组件使用 CSS（非 SVG）实现：
 * - 主干线（trunk）：1.5px 宽，渐变淡出
 * - 分支圆角：10px border-radius
 * - 活动标记：1.5px 宽，16px 高
 * - 字体：分组标签 calc(14px + 1px)，子项 14px
 * - 行高：line-height 1.2
 * - 分支位置：top: calc(50% - 5px)
 * - 主干截止：bottom: calc(36px - 10px)
 */

const settingsVue = readFileSync(new URL('src/views/AdminSettings.vue', frontendRoot), 'utf-8');

/**
 * @param {string} selector
 * @param {string} prop
 * @param {string | RegExp} expected
 */
function assertCSSRule(selector, prop, expected) {
  // 查找包含选择器的CSS规则（支持组合选择器）
  const lines = settingsVue.split('\n');
  let ruleBody = '';

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    // 检查这一行是否包含我们要找的选择器
    if (line.includes(selector) && (line.includes('{') || lines[i + 1]?.includes('{'))) {
      // 找到规则体的起始位置
      let startIdx = i;
      if (!line.includes('{')) startIdx = i + 1;

      const startLine = lines[startIdx];
      const openBrace = startLine.indexOf('{');
      if (openBrace === -1) continue;

      // 提取规则体（可能在同一行）
      if (startLine.includes('}')) {
        const closeBrace = startLine.indexOf('}');
        ruleBody = startLine.substring(openBrace + 1, closeBrace);
      } else {
        // 规则体在下一行
        for (let j = startIdx; j < lines.length; j++) {
          if (lines[j].includes('}')) {
            const endIdx = lines[j].indexOf('}');
            ruleBody = lines.slice(startIdx, j + 1).join('').split('{')[1].split('}')[0];
            break;
          }
        }
      }
      break;
    }
  }

  assert.ok(ruleBody, `应该找到 ${selector} 的 CSS 规则`);

  const propPattern = new RegExp(`\\b${prop}\\s*:\\s*([^;]+)`, 'i');
  const propMatch = ruleBody.match(propPattern);

  assert.ok(propMatch, `${selector} 应该有 ${prop} 属性\n规则体: ${ruleBody.substring(0, 200)}`);

  const value = propMatch[1].trim();

  if (expected instanceof RegExp) {
    assert.match(value, expected, `${selector} { ${prop}: ${value} } 应匹配 ${expected}`);
  } else {
    assert.equal(value, expected, `${selector} { ${prop}: ${value} } 应该是 ${expected}`);
  }
}

test('二级侧边栏 - 主干线宽度 1.5px（非 2px）', () => {
  assertCSSRule('.settings-nav::before', 'width', '1.5px');
});

test('二级侧边栏 - 活动标记宽度 1.5px', () => {
  assertCSSRule('.settings-nav-marker', 'width', '1.5px');
});

test('二级侧边栏 - 活动标记高度 16px', () => {
  assertCSSRule('.settings-nav-marker', 'height', '16px');
});

test('二级侧边栏 - 分组标签字体 calc(14px + 1px)', () => {
  assertCSSRule('.settings-nav-group-wrap > .settings-nav-group', 'font', /calc\(14px\s*\+\s*1px\)\/1\.2/i);
});

test('二级侧边栏 - 子项字体 14px，行高 1.2', () => {
  assertCSSRule('.settings-nav-item', 'font', /400\s+14px\/1\.2/i);
});

test('二级侧边栏 - 展开区主干宽度 1.5px', () => {
  assertCSSRule('.settings-nav-children::before', 'width', '1.5px');
});

test('二级侧边栏 - 主干截止位置 calc(36px - 10px)', () => {
  assertCSSRule('.settings-nav-children::before', 'bottom', /calc\(36px\s*-\s*10px\)/i);
});

test('二级侧边栏 - 主干圆角 1px', () => {
  assertCSSRule('.settings-nav-children::before', 'border-radius', '1px');
});

test('二级侧边栏 - 分支圆角 10px', () => {
  assertCSSRule('.settings-nav-item::before', 'border-bottom-left-radius', '10px');
});

test('二级侧边栏 - 分支位置 calc(50% - 5px)', () => {
  assertCSSRule('.settings-nav-item::before', 'top', /calc\(50%\s*-\s*5px\)/i);
  assertCSSRule('.settings-nav-item::after', 'top', /calc\(50%\s*-\s*5px\)/i);
});

test('二级侧边栏 - 分支尺寸 18px × 10px', () => {
  assertCSSRule('.settings-nav-item::before', 'width', '18px');
  assertCSSRule('.settings-nav-item::before', 'height', '10px');
});

test('二级侧边栏 - 分支线宽 1.5px', () => {
  assertCSSRule('.settings-nav-item::before', 'border-bottom', /1\.5px\s+solid/i);
  assertCSSRule('.settings-nav-item::before', 'border-left', /1\.5px\s+solid/i);
});

test('二级侧边栏 - 活动分支延伸宽度 1.5px', () => {
  assertCSSRule('.settings-nav-active-reach', 'width', '1.5px');
});

