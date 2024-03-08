import * as React from "react";
import { styled, useTheme, makeStyles } from "@mui/material/styles";
import Box from "@mui/material/Box";
import { TextareaAutosize } from "@mui/material";
import MuiDrawer from "@mui/material/Drawer";
import MuiAppBar from "@mui/material/AppBar";
import Toolbar from "@mui/material/Toolbar";
import List from "@mui/material/List";
import CssBaseline from "@mui/material/CssBaseline";
import Typography from "@mui/material/Typography";
import Divider from "@mui/material/Divider";
import IconButton from "@mui/material/IconButton";
import MenuIcon from "@mui/icons-material/Menu";
import ChevronLeftIcon from "@mui/icons-material/ChevronLeft";
import ChevronRightIcon from "@mui/icons-material/ChevronRight";
import ListItem from "@mui/material/ListItem";
import ListItemButton from "@mui/material/ListItemButton";
import ListItemIcon from "@mui/material/ListItemIcon";
import ListItemText from "@mui/material/ListItemText";
import InboxIcon from "@mui/icons-material/MoveToInbox";
import HistoryIcon from "@mui/icons-material/History";
import { useState, useEffect, useRef } from "react";
import { Link } from "react-router-dom";
import renderMessageContent from "./RenderMarkdown";
// import TextareaAutosize from "react-textarea-autosize";
import { FaRegCircleUser } from "react-icons/fa6";
import useMediaQuery from "@mui/material/useMediaQuery";
import { createTheme, ThemeProvider } from "@mui/material/styles";
import MessageIcon from "@mui/icons-material/Message";
import PersonIcon from "@mui/icons-material/Person";
import Avatar from "@mui/material/Avatar";

const drawerWidth = 240;

const openedMixin = (theme) => ({
  width: drawerWidth,
  transition: theme.transitions.create("width", {
    easing: theme.transitions.easing.sharp,
    duration: theme.transitions.duration.enteringScreen,
  }),
  overflowX: "hidden",
});

const closedMixin = (theme) => ({
  transition: theme.transitions.create("width", {
    easing: theme.transitions.easing.sharp,
    duration: theme.transitions.duration.leavingScreen,
  }),
  overflowX: "hidden",
  width: `calc(${theme.spacing(7)} + 1px)`,
  [theme.breakpoints.up("sm")]: {
    width: `calc(${theme.spacing(8)} + 1px)`,
  },
});

const DrawerHeader = styled("div")(({ theme }) => ({
  display: "flex",
  alignItems: "center",
  justifyContent: "flex-end",
  padding: theme.spacing(0, 1),
  // necessary for content to be below app bar
  ...theme.mixins.toolbar,
}));

const AppBar = styled(MuiAppBar, {
  shouldForwardProp: (prop) => prop !== "open",
})(({ theme, open }) => ({
  zIndex: theme.zIndex.drawer + 1,
  transition: theme.transitions.create(["width", "margin"], {
    easing: theme.transitions.easing.sharp,
    duration: theme.transitions.duration.leavingScreen,
  }),
  ...(open && {
    marginLeft: drawerWidth,
    width: `calc(100% - ${drawerWidth}px)`,
    transition: theme.transitions.create(["width", "margin"], {
      easing: theme.transitions.easing.sharp,
      duration: theme.transitions.duration.enteringScreen,
    }),
  }),
}));

const Drawer = styled(MuiDrawer, {
  shouldForwardProp: (prop) => prop !== "open",
})(({ theme, open }) => ({
  width: drawerWidth,
  flexShrink: 0,
  whiteSpace: "nowrap",
  boxSizing: "border-box",
  ...(open && {
    ...openedMixin(theme),
    "& .MuiDrawer-paper": openedMixin(theme),
  }),
  ...(!open && {
    ...closedMixin(theme),
    "& .MuiDrawer-paper": closedMixin(theme),
  }),
}));

export default function MiniDrawer() {
  const theme = useTheme();
  const [open, setOpen] = React.useState(false);
  const [messages, setMessages] = useState([]);
  const [history, setHistory] = useState([]);
  const [inputValue, setInputValue] = useState("");
  const [socket, setSocket] = useState(null);
  const [isSidebarShown, setIsSidebarShown] = useState(true);
  const messageBuffer = useRef("");
  const messagesEndRef = useRef(null); // For smooth scrolling
  const inputValueRef = useRef(null); // For smooth scrolling
  const [isFocused, setIsFocused] = useState(false);

  const prefersDarkMode = useMediaQuery("(prefers-color-scheme: dark)");

  const Usertheme = React.useMemo(
    () =>
      createTheme({
        palette: {
          mode: prefersDarkMode ? "dark" : "light",
          primary: {
            main: "#90caf9",
          },
        },
      }),
    [prefersDarkMode]
  );

  useEffect(() => {
    const ws = new WebSocket("ws://localhost:8080");
    setSocket(ws);

    ws.onmessage = (event) => {
      const newChunk = event.data;
      // messageBuffer.current += newChunk;

      setMessages((prevMessages) => {
        const lastMessage = prevMessages[prevMessages.length - 1];
        let updatedMessages = [...prevMessages];
        if (lastMessage && lastMessage.sender === "server") {
          const updatedLastMessage = { ...lastMessage, content: lastMessage.content + newChunk };
          updatedMessages = updatedMessages.slice(0, -1).concat(updatedLastMessage);
        } else {
          updatedMessages.push({ content: newChunk, sender: "server" });
        }
        return updatedMessages;
      });
    };

    // Clean up the WebSocket connection on unmount
    return () => {
      if (socket) {
        socket.close();
      }
    };
  }, []);

  const handleDrawerOpen = () => {
    setOpen(true);
  };

  const handleDrawerClose = () => {
    setOpen(false);
  };

  const sendMessage = () => {
    if (socket && inputValue.trim() !== "") {
      const message = {
        content: inputValue,
        timestamp: new Date().toISOString(),
        sender: "user",
      };

      setMessages((prevMessages) => [...prevMessages, message]);
      setInputValue("");
      socket.send(inputValue);
    }
  };

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
}, [messages]);

  return (
    <ThemeProvider theme={Usertheme}>
      <Box
        sx={{
          display: "flex ",
          overflowY: "auto",          
        }}
        className="custom-scrollbar"
      >
        <CssBaseline />
        <AppBar
          key={theme.palette.mode}
          //   sx={{backgroundColor: theme.palette.mode === 'dark' ? '#424242' : '#ffffff',
          // color: theme.palette.mode === 'dark' ? '#ffffff' : '#000000'
          // }}
          position="fixed"
          open={open}
        >
          <Toolbar>
            <IconButton
              color="inherit"
              aria-label="open drawer"
              onClick={handleDrawerOpen}
              edge="start"
              sx={{
                marginRight: 5,
                ...(open && { display: "none" }),
              }}
            >
              <MenuIcon />
            </IconButton>
            <Typography
              sx={{ fontFamily: "Monospace" }}
              variant="h6"
              noWrap
              component="div"
            >
              BhilaiGPT
            </Typography>
          </Toolbar>
        </AppBar>
        <Drawer
          sx={
            {
              // "& .MuiDrawer-paper": {
              //   backgroundColor: "#eff3ff",
              // },
            }
          }
          variant="permanent"
          open={open}
        >
          <DrawerHeader>
            <IconButton onClick={handleDrawerClose}>
              {theme.direction === "rtl" ? (
                <ChevronRightIcon />
              ) : (
                <ChevronLeftIcon />
              )}
            </IconButton>
          </DrawerHeader>
          <Divider />
          <List>
            <ListItem key={1} disablePadding sx={{ display: "block" }}>
              <ListItemButton
                onClick={() => {
                  setHistory([...history, ...messages]);
                  setMessages([]);
                }}
                title="New Chat"
                sx={{
                  minHeight: 48,
                  justifyContent: open ? "initial" : "center",
                  px: 2.5,
                }}
              >
                <ListItemIcon
                  sx={{
                    minWidth: 0,
                    mr: open ? 3 : "auto",
                    justifyContent: "center",
                  }}
                >
                  <MessageIcon />
                </ListItemIcon>
                <ListItemText
                  primary="New Chat"
                  sx={{ opacity: open ? 1 : 0 }}
                />
              </ListItemButton>
            </ListItem>
            <ListItem key={2} disablePadding sx={{ display: "block" }}>
              <ListItemButton
                onClick={() => {
                  if (history.length !== 0) setMessages(history);
                }}
                title="History"
                sx={{
                  minHeight: 48,
                  justifyContent: open ? "initial" : "center",
                  px: 2.5,
                }}
              >
                <ListItemIcon
                  sx={{
                    minWidth: 0,
                    mr: open ? 3 : "auto",
                    justifyContent: "center",
                  }}
                >
                  <HistoryIcon />
                </ListItemIcon>
                <ListItemText
                  primary="History"
                  sx={{ opacity: open ? 1 : 0 }}
                />
              </ListItemButton>
            </ListItem>
          </List>
          <Divider />
          <List>
            {["All mail", "Trash", "Spam"].map((text, index) => (
              <ListItem key={text} disablePadding sx={{ display: "block" }}>
                <ListItemButton
                  sx={{
                    minHeight: 48,
                    justifyContent: open ? "initial" : "center",
                    px: 2.5,
                  }}
                >
                  <ListItemIcon
                    sx={{
                      minWidth: 0,
                      mr: open ? 3 : "auto",
                      justifyContent: "center",
                    }}
                  >
                    {index % 2 === 0 ? <InboxIcon /> : <HistoryIcon />}
                  </ListItemIcon>
                  <ListItemText primary={text} sx={{ opacity: open ? 1 : 0 }} />
                </ListItemButton>
              </ListItem>
            ))}
          </List>
        </Drawer>
        {/* <Box
          className="flex flex-col h-screen w-screen"
          component="main"
          sx={{ backgroundColor: "" }}
        > */}
        <Box
          className={`flex flex-grow p-4 flex-wrap m-auto mt-10 mb-10 h-full max-w-screen-md`}
        >
          {messages.length === 0 ? (
            <Box
              sx={{
                display: "flex",
                justifyContent: "left",
                alignItems: "center",

                height: "inherit", // Adjust as needed
                marginTop: "6rem",
              }}
            >
              <Typography
                sx={{ fontFamily: "cursive" }}
                variant=""
                className="text-6xl sm:text-8xl md:text-9xl  font-serif bg-gradient-to-br from-pink-500 to-blue-900 text-transparent bg-clip-text"
              >
                Welcome
              </Typography>
            </Box>
          ) : (
            <List className="flex flex-col gap-2 text-wrap w-full pb-16">
              {messages.map((message, index) => (
                <ListItem
                  sx={{
                    display: "flex",
                    justifyContent: message.sender === "user" ? "flex-end" : "",
                  }}
                  // className={`flex`}
                  key={index}
                >
                  {message.sender === "server" && (
                    <Avatar>
                      <img
                        className="h-full w-full"
                        src="https://img.icons8.com/fluency/48/message-bot.png"
                        alt="message-bot"
                      />
                    </Avatar>
                  )}
                  <Box
                    sx={{ wordBreak: "break-word", textWrap: "wrap" }}
                    key={index}                    
                    className={`p-2 rounded-lg font-google-sans break-words
                             ${message.sender === "user"
                        ? "bg-blue-500 text-white dark:bg-blue-700 max-w-fit"
                        : "dark:text-white max-w-full"
                      }`}
                  >
                    {renderMessageContent(message.content)}
                  </Box>
                  {message.sender === "user" && (
                    <Avatar sx={{ marginLeft: "0.5rem" }}>
                      {/* <FaRegCircleUser className=" h-8 w-8 text-black dark:ircleUser className=" h-8 w-8 text-black dark:text-white" /> */}
                      <PersonIcon />
                    </Avatar>
                  )}
                </ListItem>
              ))}             
              <Box ref={messagesEndRef} /> {/* Reference for scrolling */}
            </List>
          )}
        </Box>
        <Box
          sx={{
            position: "fixed",
            bottom: "0",
            left: "50%",
            transform: "translateX(-45%)",
            width: "calc(min(60%, 768px))",
            backgroundColor: "transparent",
          }}
          className="flex justify-center items-center py-2"
        >
          <TextareaAutosize
            ref={inputValueRef}
            placeholder="Enter your message..."
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter" && !e.shiftKey) {
                e.preventDefault();
                sendMessage();
              } else if (e.key === "Enter" && e.shiftKey) {
                e.preventDefault();
                const currentValue = e.target.value + "\n";
                setInputValue(currentValue);
                if (inputValueRef.current) {
                  inputValueRef.current.scrollIntoView(false, {
                    behavior: "smooth",
                  });
                }
              }
            }}
            minRows={1}
            maxRows={isFocused ? 6 : 1}
            onFocus={() => setIsFocused(true)} // Set isFocused to true when the textarea is focused
            onBlur={() => setIsFocused(false)} // Set isFocused to false when the textarea loses focus
            wrap="soft"
            className={`flex-grow resize-none px-4 py-4 mr-2 border custom-scrollbar border-gray-300 ${inputValue.split("\n").length > 1 ? "rounded-xl" : "rounded-full"
              } focus:outline-none w-full max-w-screen-md shadow-xl shadow-gray-400 dark:bg-gray-700 dark:text-white dark:border-gray-600 dark:placeholder-gray-400 transition duration-300`}
          />
        </Box>
      </Box>
      {/* </Box> */}
    </ThemeProvider>
  );
}
