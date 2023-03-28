const instanceAxios = axios.create({
    baseURL: "https://5f55a98f39221c00167fb11a.mockapi.io/", // Defalt URL
    timeout: 100000 //Time wait request - if request longer 10000ms (10 second) - aborted request
});

// function sleep fake internet slow with call API
const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

let isMaxPage = false;

// async function get list blog and call function handleRenderBlogs
const handleGetBlogs = async (page) => {
    try {
        const response =
            page &&
            (await instanceAxios.get(`blogs`, {
                params: {
                    limit: 10,
                    page
                }
            }));
        await sleep(1000); // sleep 1000 ms - 1 second
        console.log(response);

        handleRenderBlogs(response.data);
        // success
        if (response.status == 200) {
            $("#skeleton").fadeOut("slow");

            // check data of api, if empty then return and set is max page
            if (!(response.data && response.data.length)) {
                isMaxPage = true;
            }
        }
    } catch (error) {
        toastr.error(error.responseText || error.message || error.statusText);
        console.error(error);
    }
};

// Render blog list to HTML
const handleRenderBlogs = (blogs) => {
    let html = "";
    blogs.map(
        (blog) =>
            (html += `
        <a href="#" class="text-dark blog-item">
            <div class="row mb-4 border-bottom pb-3">
              <div class="col-3">
                <img
                  src="${blog.image}"
                  class="img-fluid shadow-strong rounded"
                  alt="${blog.title}"
                />
              </div>
              <div class="col-9">
                <p class="mb-2"><strong>${blog.title}</strong></p>
                <p><u>${new Date(blog.createdAt).toLocaleDateString()}</u></p>
              </div>
            </div>
          </a>
        `)
    );

    //get current html of news element and insert new html render
    $("#news").append(html);
};

document.addEventListener("DOMContentLoaded", () => {
    let lastItem = document.getElementById("load-more");
    let page = 0;

    new IntersectionObserver(
        (entries, observer) => {
            entries.map((entry) => {
                console.log(entry.intersectionRatio);
                // check max page and lastItem show in viewport
                if (isMaxPage && entry.intersectionRatio >= 0.01) {
                    toastr.options.timeOut = 5;
                    toastr.warning("End page!");
                    return;
                }

                // if lastItem is show in view port
                if (entry.isIntersecting) {
                    // show skeleton
                    $("#skeleton").show();

                    page += 1;
                    handleGetBlogs(page);
                }
            });
        },
        { threshold: 0 }
    ).observe(lastItem);
});
