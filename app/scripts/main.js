/*!
 *
 *  Web Starter Kit
 *  Copyright 2015 Google Inc. All rights reserved.
 *
 *  Licensed under the Apache License, Version 2.0 (the "License");
 *  you may not use this file except in compliance with the License.
 *  You may obtain a copy of the License at
 *
 *    https://www.apache.org/licenses/LICENSE-2.0
 *
 *  Unless required by applicable law or agreed to in writing, software
 *  distributed under the License is distributed on an "AS IS" BASIS,
 *  WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 *  See the License for the specific language governing permissions and
 *  limitations under the License
 *
 */
/* eslint-env browser */
(function() {
  "use strict";
  // Check to make sure service workers are supported in the current browser,
  // and that the current page is accessed from a secure origin. Using a
  // service worker from an insecure origin will trigger JS console errors. See
  // http://www.chromium.org/Home/chromium-security/prefer-secure-origins-for-powerful-new-features
  var isLocalhost = Boolean(
    window.location.hostname === "localhost" ||
      // [::1] is the IPv6 localhost address.
      window.location.hostname === "[::1]" ||
      // 127.0.0.1/8 is considered localhost for IPv4.
      window.location.hostname.match(
        /^127(?:\.(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)){3}$/
      )
  );

  if (
    "serviceWorker" in navigator &&
    (window.location.protocol === "https:" || isLocalhost)
  ) {
    navigator.serviceWorker
      .register("service-worker.js")
      .then(function(registration) {
        // updatefound is fired if service-worker.js changes.
        registration.onupdatefound = function() {
          // updatefound is also fired the very first time the SW is installed,
          // and there's no need to prompt for a reload at that point.
          // So check here to see if the page is already controlled,
          // i.e. whether there's an existing service worker.
          if (navigator.serviceWorker.controller) {
            // The updatefound event implies that registration.installing is set:
            // https://slightlyoff.github.io/ServiceWorker/spec/service_worker/index.html#service-worker-container-updatefound-event
            var installingWorker = registration.installing;

            installingWorker.onstatechange = function() {
              switch (installingWorker.state) {
                case "installed":
                  // At this point, the old content will have been purged and the
                  // fresh content will have been added to the cache.
                  // It's the perfect time to display a "New content is
                  // available; please refresh." message in the page's interface.
                  break;

                case "redundant":
                  throw new Error(
                    "The installing " + "service worker became redundant."
                  );

                default:
                // Ignore
              }
            };
          }
        };
      })
      .catch(function(e) {
        console.error("Error during service worker registration:", e);
      });
  }

  // Your custom JavaScript goes here

  // Retrieve the object from storage
  const retrievedStepArray = JSON.parse(localStorage.getItem("stepArray"));

  const formToJSON = form => {
    const formArray = $(form).serializeArray();
    var returnArray = {};
    for (var i = 0; i < formArray.length; i++) {
      returnArray[formArray[i]["name"]] = formArray[i]["value"];
    }
    return returnArray;
  };

  const dialog = document.querySelector("#step-form-dialog");

  let stepArray = [];

  const appendStepsTolist = () => {
    let stepList = "";
    stepArray.forEach(step => {
      stepList += `<li class="mdl-list__item">
                  <span class="mdl-list__item-primary-content">
                    ${step.stepName}
                  </span>
                  <i data-name="${step.stepName}" class="material-icons list-delete">delete</i> <i data-name="${step.stepName}" class="material-icons list-edit">edit</i>
                </li>`;
    });

    const stepListHtml = $.parseHTML(stepList);
    $("#steps-list").html(stepListHtml);
  };

  const progressStepTemplate = (step, last) => {
    return `  <div class="step">
    ${last ? "" : '<div class="step-progress"></div>'}
    <div class="icon-wrapper">
      <svg class="icon icon-checkmark" viewBox="0 0 32 32"><path class="path1" d="M27 4l-15 15-7-7-5 5 12 12 20-20z"></path>  </svg>
      <div class="step-text">${step}</div>
    </div>
  </div>`;
  };

  const testStepTemplate = step => {
    return `
      <h3>Name: ${step.stepName}</h3>
      <div class="step-details">
        <h4>Description:</h4> ${step.stepDescription} <br>
      </div>
      <div class="step-details">
        <h4>Input:</h4> ${step.stepInput} <br>
      </div>
      <div class="step-details">
        <h4>Output:</h4> ${step.stepOutput} <br>
      </div>`;
  };

  const stepSummaryTemplate = step => {
    console.log(step);
    return `
    <div class="step-details">
      <h3>Name: ${step.stepName}</h3>
      <h3>Status: ${step.stepSucced ? "Succed" : "Failed"}</h3>
      <h4>Description:</h4> ${step.stepDescription} <br>
      <h4>Input:</h4> ${step.stepInput} <br>
      <h4>Output:</h4> ${step.stepOutput} <br>
      <h4>Comments:</h4> ${step.stepComments} <br>
    </div>`;
  };

  const appendStepsToProgressBar = () => {
    let progressBarSteps = "";
    stepArray.forEach((step, index) => {
      let last = stepArray.length - 1 == index ? true : false;

      progressBarSteps += progressStepTemplate(step.stepName, last);
    });
    progressBarSteps = $.parseHTML(progressBarSteps);
    $("#progress-bar").html(progressBarSteps);
  };

  if (retrievedStepArray) {
    if (retrievedStepArray.length > 0) {
      stepArray = retrievedStepArray;
      appendStepsTolist();
      appendStepsToProgressBar();
      localStorage.setItem("stepArray", JSON.stringify(stepArray));
    }
  }

  $("#open-step-form").click(() => {
    $("#add-step").removeClass("hide");
    $("#save-step").addClass("hide");
    dialog.showModal();
  });

  let editingIndex = 0;

  $("#save-step").click(() => {
    stepArray[editingIndex] = formToJSON($("#step-form"));
    appendStepsTolist();
    appendStepsToProgressBar();
    localStorage.setItem("stepArray", JSON.stringify(stepArray));

    dialog.close();

    $("#step-form")[0].reset();

    $("#step-name").parent().removeClass("is-dirty");
    $("#step-desc").parent().removeClass("is-dirty");
    $("#step-input").parent().removeClass("is-dirty");
    $("#step-output").parent().removeClass("is-dirty");
  });

  $(".list-edit").click(e => {
    $("#edit-step").removeClass("hide");
    $("#add-step").addClass("hide");

    const stepName = $(e.target).data("name");
    const editingStep = stepArray.find((step, index) => {
      if (step.stepName == stepName) {
        editingIndex = index;
        return true;
      }
      return false;
    });

    $("#step-name").val(editingStep.stepName).parent().addClass("is-dirty");
    $("#step-desc")
      .val(editingStep.stepDescription)
      .parent()
      .addClass("is-dirty");
    $("#step-input").val(editingStep.stepInput).parent().addClass("is-dirty");
    $("#step-output").val(editingStep.stepOutput).parent().addClass("is-dirty");

    dialog.showModal();
  });

  $(".list-delete").click(e => {
    if (confirm("Are you sure?") == true) {
      const stepName = $(e.target).data("name");
      stepArray = stepArray.filter(step => {
        return step.stepName != stepName;
      });
      appendStepsTolist();
      appendStepsToProgressBar();
      localStorage.setItem("stepArray", JSON.stringify(stepArray));
    }
  });
  $("#close-step-form").click(() => {
    dialog.close();
  });
  $("#add-step").click(() => {
    $("#step-form").submit();
  });
  $("#step-form").submit(e => {
    e.preventDefault();
    stepArray.push(formToJSON($("#step-form")));

    appendStepsTolist();
    appendStepsToProgressBar();
    localStorage.setItem("stepArray", JSON.stringify(stepArray));

    dialog.close();
    $("#step-form")[0].reset();
  });
  $("#clear-test").click(() => {
    if (confirm("Are you sure?") == true) {
      window.localStorage.clear();
      stepArray = [];
      appendStepsTolist();
      appendStepsToProgressBar();
      localStorage.setItem("stepArray", JSON.stringify(stepArray));
    }
  });

  const getSummary = () => {
    let stepSummary = '';
    console.log(stepArray);
    stepArray.forEach((step)=>{
      console.log(step);
      stepSummary += stepSummaryTemplate(step);
    })
    $('#test-summary').html(stepSummary);
  }

  let workingStepIndex = 0;

  const testStepFailed = () => {
    stepArray[workingStepIndex].stepComments = $("#step-comment").val();
    stepArray[workingStepIndex].stepSucced = false;
    localStorage.setItem("stepArray", JSON.stringify(stepArray));

    $($("#progress-bar .step")[workingStepIndex]).addClass("done failed");

    workingStepIndex++;

    if (workingStepIndex == stepArray.length) {
      $('#test-panel').removeClass('is-active');
      $('#test-tab').removeClass('is-active');
      $('#summary-panel').addClass('is-active');
      $('#summay-tab').addClass('is-active');

      getSummary();
    }
    else {
      $("#step-comment").val("");
      $("#step-test").html(testStepTemplate(stepArray[workingStepIndex]));
    }
  };

  const testStepSucced = () => {
    stepArray[workingStepIndex].stepComments = $("#step-comment").val();
    stepArray[workingStepIndex].stepSucced = true;
    localStorage.setItem("stepArray", JSON.stringify(stepArray));

    $($("#progress-bar .step")[workingStepIndex]).addClass("done");

    workingStepIndex++;

    if (workingStepIndex == stepArray.length) {
      $('#test-panel').removeClass('is-active');
      $('#test-tab').removeClass('is-active');
      $('#summary-panel').addClass('is-active');
      $('#summay-tab').addClass('is-active');

      getSummary();
    }
    else {
      $("#step-comment").val("");
      $("#step-test").html(testStepTemplate(stepArray[workingStepIndex]));
    }
  };

  $("#start-test").click(() => {
    $("#setup-tab").toggleClass("is-active");
    $("#setup-panel").toggleClass("is-active");
    $("#test-tab").toggleClass("is-active");
    $("#test-panel").toggleClass("is-active");
    $("#step-test").html(testStepTemplate(stepArray[workingStepIndex]));
  });

  $("#test-step-failed").click(() => {
    testStepFailed();
  });

  $("#test-step-succed").click(() => {
    testStepSucced();
  });
})();
