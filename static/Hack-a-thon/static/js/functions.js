/**
 * Copyright 2010 Google Inc.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

function log(obj) {
  var bg = chrome.extension.getBackgroundPage() || window;
  bg.console.log(obj);
};

function localizeText(text) {
  var regexp = /__MSG_(\w+)__/gm;
  var matches = null;
  while (matches = regexp.exec(text)) {
    if (matches.length > 1) {
      var replace_text = chrome.i18n.getMessage(matches[1]);
      log("Replacing " + matches[1] + " with " + replace_text);
      text = text.replace('__MSG_' + matches[1] + '__', replace_text);
    }    
  }
  return text;
};

function localizeTags() {
  var text = document.body.innerHTML;
  document.body.innerHTML = localizeText(text);
  
  var title = localizeText(document.title.toString());
  document.title = title;
};

function startPreso() {
  chrome.tabs.create({ url: chrome.extension.getURL('index.html')});
};

