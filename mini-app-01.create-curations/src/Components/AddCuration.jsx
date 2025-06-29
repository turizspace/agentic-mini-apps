import React, { useState, useEffect } from "react";
import { nip19 } from "nostr-tools";
import LoadingDots from "./LoadingDots";
import { nanoid } from "nanoid";
import { useDispatch } from "react-redux";
import UploadFile from "./UploadFile";
import { setToast } from "../Store/Slides/StoreSlides";
import { getParsedRepEvent, getSubData } from "../Helpers/Helpers";

export default function AddCuration({ userPubkey, signEvent }) {
  const dispatch = useDispatch();
  const [title, setTitle] = useState("");
  const [excerpt, setExcerpt] = useState("");
  const [thumbnailUrl, setThumbnailUrl] = useState("");
  const [posts, setPosts] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [showPostsList, setShowPostsList] = useState(false);
  const [kind, setKind] = useState(30004);

  const handleFileUplaod = (url) => {
    setThumbnailUrl(url);
  };
  const handleDataUpload = async () => {
    try {
      setIsLoading(true);
      let cover = thumbnailUrl;
      let tempTags = getTags(title, excerpt, cover);
      if (!tempTags) {
        setIsLoading(false);
        return;
      }
      signEvent({
        content: "",
        kind,
        tags: tempTags,
      });
    } catch (err) {
      console.log(err);
      dispatch(
        setToast({
          type: 2,
          desc: "An error has occurred!",
        })
      );
    }
  };

  const getTags = (title, description, image) => {
    let tempTags = posts.map((_) => ["a", _.aTag])
    let checkStatus = false;

    if (!(title && image)) {
      dispatch(
        setToast({
          type: 2,
          desc: "At least a title and an image is required to publish a curation",
        })
      );
      return false;
    }

    if (!checkStatus) {
      tempTags.push(["published_at", `${Math.floor(Date.now() / 1000)}`]);
      tempTags.push(["d", nanoid()]);
      tempTags.push(["title", title]);
      tempTags.push(["description", description]);
      tempTags.push(["image", image]);
      return tempTags;
    }
    for (let i = 0; i < tempTags.length; i++) {
      if (tempTags[i][0] === "title") {
        tempTags[i][1] = title;
      }
      if (tempTags[i][0] === "description") {
        tempTags[i][1] = description;
      }
      if (tempTags[i][0] === "image") {
        tempTags[i][1] = image;
      }
    }
    return tempTags;
  };
  const initThumbnail = async () => {
    setThumbnailUrl("");
  };

  const handleThumbnailValue = (e) => {
    let value = e.target.value;
    setThumbnailUrl(value);
  };
  const confirmPublishing = () => {
    handleDataUpload();
  };

  const removeItem = (index) => {
    setPosts(posts.filter((_, i) => i !== index));
  };

  return (
    <>
      {showPostsList && (
        <AddArticlesToCuration
          curationKind={kind}
          userPubkey={userPubkey}
          posts_={posts}
          setPosts_={(data) => {
            setPosts(data);
            setShowPostsList(false);
          }}
          exit={() => setShowPostsList(false)}
        />
      )}
      <section
        className="fit-container fx-centered fx-col sc-s-18 bg-sp"
        style={{ rowGap: 0, margin: ".5rem 0" }}
      >
        <div className="fit-container fx-centered fx-col">
          <div
            className="fit-container fx-centered  bg-img cover-bg"
            style={{
              position: "relative",

              height: "200px",
              borderRadius: "0",
              backgroundImage: `url(${thumbnailUrl})`,
              backgroundColor: "var(--dim-gray)",
            }}
          >
            {!thumbnailUrl && (
              <div className="fx-col fx-centered">
                <p className="p-medium gray-c">(Thumbnail preview)</p>
              </div>
            )}
            {thumbnailUrl && (
              <div
                style={{
                  width: "32px",
                  height: "32px",
                  position: "absolute",
                  right: "16px",
                  top: "16px",
                  backgroundColor: "var(--dim-gray)",
                  borderRadius: "var(--border-r-50)",
                  zIndex: 10,
                }}
                className="fx-centered pointer"
                onClick={initThumbnail}
              >
                <div className="trash"></div>
              </div>
            )}
          </div>
          <div className="fx-centered fx-wrap fit-container box-pad-h-m">
            <div className="fit-container fx-centered">
              <input
                type="text"
                className="if ifs-full"
                placeholder={"Image url"}
                value={thumbnailUrl}
                onChange={handleThumbnailValue}
              />
              <UploadFile round={true} setImageURL={handleFileUplaod} userPubkey={userPubkey} />
            </div>
            <input
              type="text"
              className="if ifs-full"
              placeholder={"Title"}
              value={title}
              onChange={(e) => setTitle(e.target.value)}
            />
            <textarea
              type="text"
              className="if ifs-full"
              placeholder={"Description"}
              value={excerpt}
              onChange={(e) => setExcerpt(e.target.value)}
              style={{ height: "100px", paddingTop: "1rem" }}
            />
            <div className={`fx-scattered  if ifs-full `}>
              {kind === 30004 && (
                <p className="p-medium green-c slide-left">
                  {"Articles curation"}
                </p>
              )}
              {kind === 30005 && (
                <p className="p-medium orange-c slide-right">
                  {"Videos curation"}
                </p>
              )}
              <div
                className={`toggle ${kind === 30005 ? "toggle-orange" : ""} ${
                  kind === 30004 ? "toggle-green" : ""
                }`}
                onClick={() => {
                  kind === 30004 ? setKind(30005) : setKind(30004);
                }}
              ></div>
            </div>
          </div>
        </div>
        <div className="fit-container fx-scattered box-pad-h-m box-pad-v-m">
          <h4>{kind === 30004 ? "Articles" : "Videos"}</h4>
          <div
            className="round-icon-small"
            onClick={() => setShowPostsList(true)}
          >
            <div className="plus-sign"></div>
          </div>
        </div>
        {posts.length === 0 && (
          <div
            className="fit-container fx-centered"
            style={{ height: "100px" }}
          >
            <div className="fx-centered fx-col" style={{ gap: 0 }}>
              <p>Your list is empty</p>
              <p className="gray-c">Try to add more items from the list</p>
            </div>
          </div>
        )}
        {posts.length > 0 && (
          <div
            className={`fx-centered fx-start-h fx-col box-pad-h-m fit-container`}
          >
            {posts.map((item, index) => {
              return (
                <div
                  key={item.id}
                  className="fx-scattered sc-s-18 bg-sp fx-shrink fit-container box-pad-h-s box-pad-v-s pointer"
                  onClick={() => handleAddArticle(item)}
                >
                  <div
                    className="bg-img cover-bg"
                    style={{
                      minWidth: "50px",
                      minHeight: "50px",
                      backgroundImage: `url(${item.image})`,
                      backgroundColor: "vaR(--dim-gray)",
                      borderRadius: "var(--border-r-50)",
                    }}
                  ></div>
                  <div
                    className="fit-container fx-centered fx-start-h fx-start-v fx-col"
                    style={{ rowGap: 0 }}
                  >
                    <p className="gray-c p-medium">
                      {new Date(item.created_at * 1000).toISOString()}
                    </p>
                    <p className="p-one-line">{item.title}</p>
                  </div>

                  <div
                    className="box-pad-h-s"
                    onClick={() => removeItem(index)}
                  >
                    <div className="trash"></div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
        <div className="box-pad-v-m fx-centered fit-container box-pad-h-m">
          <button
            className="btn btn-normal btn-full"
            onClick={confirmPublishing}
          >
            {isLoading ? <LoadingDots /> : <>Publish</>}
          </button>
        </div>
      </section>
    </>
  );
}

const AddArticlesToCuration = ({
  exit,
  curationKind,
  userPubkey,
  posts_,
  setPosts_,
}) => {
  const dispatch = useDispatch();
  const [posts, setPosts] = useState(posts_);
  const [NostrPosts, setNostrPosts] = useState([]);
  const [searchedPostsByNaddr, setSearchedPostByNaddr] = useState([]);
  const [isLoaded, setIsLoaded] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [searchedPost, setSearchedPost] = useState("");
  const [searchRes, setSearchRes] = useState([]);
  const [contentFrom, setContentFrom] = useState("relays");
  const [lastEventTime, setLastEventTime] = useState(undefined);
  const arts = curationKind === 30004;
  const postKind = arts ? 30023 : 34235;

  useEffect(() => {
    const fetchData = async () => {
      let data = await getSubData(
        contentFrom === "relays"
          ? [
              {
                kinds: [postKind],
                limit: 10,
                until: lastEventTime,
              },
            ]
          : [
              {
                kinds: [postKind],
                authors: [userPubkey],
                limit: 10,
                until: lastEventTime,
              },
            ]
      );
      setNostrPosts((prev) => [
        ...prev,
        ...data.data.map((_) => getParsedRepEvent(_)),
      ]);
      setIsLoaded(true);
      setIsLoading(false);
    };
    fetchData();
  }, [contentFrom, lastEventTime]);

  const saveUpdate = async () => {
    let tempTags = [];
    for (let post of posts) tempTags.push(["a", post.aTag]);
  };

  const handleAddArticle = (post) => {
    let tempArray = Array.from(posts);
    let index = tempArray.findIndex((item) => item.id === post.id);
    if (index === -1) {
      setPosts([...posts, post]);
      return;
    }
    tempArray.splice(index, 1);
    setPosts(tempArray);
  };

  const checkIfBelongs = (post_id) => {
    return posts.find((post) => post.id === post_id) ? true : false;
  };

  const handleSearchPostInNOSTR = (e) => {
    let search = e.target.value;
    setSearchedPost(search);
    if (!search) {
      setSearchRes([]);
      return;
    }
    let tempArray = Array.from(
      NostrPosts.filter((item) =>
        item.title.toLowerCase().includes(search.toLowerCase())
      )
    );
    setSearchRes(tempArray);
  };

  const switchContentSource = (source) => {
    setNostrPosts([]);
    setLastEventTime(undefined);
    setSearchRes([]);
    setSearchedPost("");
    if (contentFrom === source) return;
    setContentFrom(source);
  };

  const handleSearchByNaddr = async (e) => {
    let input = e.target.value;
    if (!input) return;
    try {
      let parsedData = nip19.decode(input);
      setIsLoading(true);
      let data = await getSubData([
        {
          kinds: [postKind],
          authors: [parsedData.data.pubkey],
          "#d": [parsedData.data.identifier],
        },
      ]);
      let event = data.data.length > 0 ? data.data[0] : null;

      if (event) {
        setSearchedPostByNaddr((prev) => [
          getParsedRepEvent(event.rawEvent()),
          ...prev,
        ]);
      } else {
        dispatch(
          setToast({
            type: 2,
            desc: arts
              ? "Could not found the article"
              : "Could not found the video",
          })
        );
      }
      setIsLoading(false);
    } catch (err) {
      console.log(err);
      dispatch(
        setToast({
          type: 2,
          desc: "Invalid naddr",
        })
      );
    }
  };

  if (!isLoaded)
    return (
      <div
        className="fixed-container fx-centered "
        onClick={(e) => {
          e.stopPropagation();
          exit();
        }}
      >
        <LoadingDots />
      </div>
    );
  return (
    <>
      <section
        className="fixed-container fx-centered fx-col fx-start-h"
        style={{ overflow: "scroll" }}
        onClick={(e) => {
          e.stopPropagation();
          exit();
        }}
      >
        <div
          className="fx-centered fx-col sc-s-19 bg-sp  art-t-cur-container"
          style={{
            width: "min(100%, 600px)",
            height: "100vh",
            borderRadius: "0",
          }}
          onClick={(e) => e.stopPropagation()}
        >
          <div
            className="box-pad-h"
            style={{
              width: "min(100%, 800px)",
              height: "100%",
              overflow: "hidden",
              backgroundColor: "var(--white)",
            }}
            onClick={(e) => {
              e.stopPropagation();
            }}
          >
            <div
              className="fx-scattered fit-container"
              style={{ paddingTop: "1rem" }}
            >
              <div className="fit-container fx-centered fx-start-h">
                <button
                  className={`btn btn-small fx-centered fx-shrink ${
                    contentFrom === "relays" ? "btn-normal-gray" : "btn-gst-nc"
                  }`}
                  onClick={() => switchContentSource("relays")}
                >
                  All
                </button>
                <button
                  className={`btn btn-small fx-centered fx-shrink ${
                    contentFrom === "user" ? "btn-normal-gray" : "btn-gst-nc"
                  }`}
                  onClick={() => switchContentSource("user")}
                >
                  {arts ? "My articles" : "My videos"}
                </button>
                <button
                  className={`btn btn-small fx-centered fx-shrink ${
                    contentFrom === "search" ? "btn-normal-gray" : "btn-gst-nc"
                  }`}
                  onClick={() => switchContentSource("search")}
                >
                  Search by Naddr
                </button>
              </div>
            </div>
            {contentFrom !== "search" && (
              <>
                <div className="fit-container box-pad-v-s">
                  <input
                    type="search"
                    value={searchedPost}
                    className="if ifs-full"
                    placeholder={`Search by title (in ${NostrPosts.length} results)`}
                    onChange={handleSearchPostInNOSTR}
                    style={{ backgroundColor: "var(--white)" }}
                  />
                </div>
                {searchedPost ? (
                  <>
                    {searchRes.length === 0 && (
                      <div className="fit-container box-marg-full fx-centered">
                        <p className="gray-c italic-txt">
                          {arts ? "No article was found" : "No video was found"}
                        </p>
                      </div>
                    )}
                    {searchRes.length > 0 && (
                      <div
                        className={`fx-centered fx-start-h fx-col posts-cards ${
                          isLoading ? "flash" : ""
                        }`}
                        style={{
                          overflow: "scroll",
                          overflowX: "hidden",
                        }}
                      >
                        {searchRes.map((item) => {
                          let status = checkIfBelongs(item.id);
                          return (
                            <div
                              key={item.id}
                              className="fx-scattered sc-s-18 bg-sp fx-shrink fit-container box-pad-h-s box-pad-v-s pointer"
                              onClick={() => handleAddArticle(item)}
                              style={{
                                borderColor: status ? "var(--green-main)" : "",
                              }}
                            >
                              <div
                                className="bg-img cover-bg"
                                style={{
                                  minWidth: "50px",
                                  minHeight: "50px",
                                  backgroundImage: `url(${item.image})`,
                                  borderRadius: "var(--border-r-50)",
                                }}
                              ></div>
                              <div
                                className="fit-container fx-centered fx-start-h fx-start-v fx-col"
                                style={{ rowGap: 0 }}
                              >
                                <p className="gray-c p-medium">
                                  {new Date(
                                    item.created_at * 1000
                                  ).toISOString()}
                                </p>
                                <p className="p-one-line fit-container">
                                  {item.title}
                                </p>
                              </div>
                              {status ? (
                                <div className="box-pad-h-m">
                                  <p className="green-c p-big">&#10003;</p>
                                </div>
                              ) : (
                                <div className="box-pad-h-m">
                                  <div className="plus-sign"></div>
                                </div>
                              )}
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </>
                ) : (
                  <>
                    {NostrPosts.length > 0 && (
                      <div
                        className={`fx-centered fx-start-h fx-col ${
                          isLoading ? "flash" : ""
                        }`}
                        style={{
                          height: "87%",
                          overflow: "scroll",
                          overflowX: "hidden",
                          marginBottom: "1rem",
                        }}
                      >
                        {NostrPosts.map((item) => {
                          let status = checkIfBelongs(item.id);
                          return (
                            <div
                              key={item.id}
                              className="fx-scattered sc-s-18 bg-sp fx-shrink fit-container box-pad-h-s box-pad-v-s pointer"
                              onClick={() => handleAddArticle(item)}
                              style={{
                                borderColor: status ? "var(--green-main)" : "",
                              }}
                            >
                              <div
                                className="bg-img cover-bg"
                                style={{
                                  minWidth: "50px",
                                  minHeight: "50px",
                                  backgroundImage: `url(${item.image})`,
                                  backgroundColor: "vaR(--dim-gray)",
                                  borderRadius: "var(--border-r-50)",
                                }}
                              ></div>
                              <div
                                className="fit-container fx-centered fx-start-h fx-start-v fx-col"
                                style={{ rowGap: 0 }}
                              >
                                <p className="gray-c p-medium">
                                  {new Date(
                                    item.created_at * 1000
                                  ).toISOString()}
                                </p>
                                <p className="p-one-line">{item.title}</p>
                              </div>
                              {status ? (
                                <div className="box-pad-h-m">
                                  <p className="green-c p-big">&#10003;</p>
                                </div>
                              ) : (
                                <div className="box-pad-h-m">
                                  <div className="plus-sign"></div>
                                </div>
                              )}
                            </div>
                          );
                        })}
                      </div>
                    )}
                    {isLoading && (
                      <div className="fx-centered fit-container">
                        <div className="gray-c">
                          Loading
                          <LoadingDots />
                        </div>
                      </div>
                    )}
                  </>
                )}
              </>
            )}
            {contentFrom === "search" && (
              <>
                <div className="fit-container box-pad-v-s">
                  <input
                    type="search"
                    className="if ifs-full"
                    placeholder={"Search by Naddr"}
                    onChange={handleSearchByNaddr}
                    style={{ backgroundColor: "var(--white)" }}
                  />
                </div>
                <div
                  className={`fit-container fx-centered fx-start-h fx-col ${
                    isLoading ? "flash" : ""
                  }`}
                  style={{
                    overflow: "scroll",
                    overflowX: "hidden",
                  }}
                >
                  {searchedPostsByNaddr.map((item) => {
                    let status = checkIfBelongs(item.id);
                    return (
                      <div
                        key={item.id}
                        className="fx-scattered sc-s-18 bg-sp fx-shrink fit-container box-pad-h-s box-pad-v-s pointer"
                        onClick={() => handleAddArticle(item)}
                        style={{
                          borderColor: status ? "var(--green-main)" : "",
                        }}
                      >
                        <div
                          className="bg-img cover-bg"
                          style={{
                            minWidth: "50px",
                            minHeight: "50px",
                            backgroundImage: `url(${item.image})`,
                            borderRadius: "var(--border-r-50)",
                          }}
                        ></div>
                        <div
                          className="fit-container fx-centered fx-start-h fx-start-v fx-col"
                          style={{ rowGap: 0 }}
                        >
                          <p className="gray-c p-medium"></p>
                          <p className="p-one-line fit-container">
                            {item.title}
                          </p>
                        </div>
                        {status ? (
                          <div className="box-pad-h-m">
                            <p className="green-c p-big">&#10003;</p>
                          </div>
                        ) : (
                          <div className="box-pad-h-m">
                            <div className="plus-sign"></div>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </>
            )}
          </div>
          <div className="fx-centered box-pad-v-m">
            <button className="btn btn-gst-red" onClick={exit}>
              Cancel
            </button>
            {!isLoading && (
              <button
                className="btn btn-gst"
                onClick={() => {
                  setLastEventTime(
                    NostrPosts[NostrPosts.length - 1].created_at
                  );
                  setIsLoading(true);
                }}
              >
                Load more data
              </button>
            )}
            <button
              className={`btn fx-centered ${
                posts.length > 0 ? "btn-normal" : "btn-disabled"
              }`}
              disabled={!(posts.length > 0)}
              onClick={() => setPosts_(posts)}
            >
              Add content
              <div
                className="arrow"
                style={{ filter: "invert()", rotate: "-90deg" }}
              ></div>
            </button>
          </div>
        </div>
      </section>
    </>
  );
};
