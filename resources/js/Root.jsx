import React, { useEffect, useState } from 'react';
import * as ReactDOM from 'react-dom';
import { createRoot } from 'react-dom/client'
import * as $ from 'jquery';
import useWindowResizeThreshold, { AllImages, currentPage, FindImage, FullCurrentDate, GetErrImage, GetErrorMsg, publicImages, QuoteOfTheDay, sparkNotification, yyyy } from './Grabs.jsx';
import { createInertiaApp, Link, usePage } from '@inertiajs/react';
import { resolvePageComponent } from 'laravel-vite-plugin/inertia-helpers';
// import { InertiaProgress } from '@inertiajs/progress';
import { Inertia } from '@inertiajs/inertia';
import { notification } from 'antd';
import _ from 'lodash';
import { USALProvider } from '@usal/react';
// import '../js/Wow.js';

const csrf = document.querySelector('meta[name="csrf-token"]').content;

const appName = document.querySelector('meta[name="app-name"]').content;

// const currencyName = document.querySelector('meta[name="currency-name"]').content;

createInertiaApp({
    resolve: name => {
        const pages = import.meta.glob(`./Pages/**/*.jsx`, {eager: true})
        return pages[`./Pages/${name}.jsx`]
    },
    setup({el, App, props}) {
        createRoot(el).render(<App {...props}/>);
    }
})

// new WOW().init;

export default function Layout({children, option, contextHolder}) {

    //console.log(option);

    const auth = usePage().props;
    
    let navorigins = [
        // {id: "landing", "title": "Dashboard", "link": "/", "landing": true},
        {id: "about-us", "title": "About Us", "link": "/about-us"},
        // {id: "contact", "title": "Contact", "link": "/contact"}
    ];

    let loggedorigins = [
        {id: "home", "title": "Dashboard", "link": "/home"}
    ];

    let guestorigins = [
        {id: "login", "title": "Log In", "link": "/login"},
        {id: "register", "title": "Create Account", "link": "/register"}
    ];

    if (auth.user) {
        navorigins = _.concat(loggedorigins, navorigins);
    } 
    
    const landingNav = _.filter(navorigins, (a)=>{return a.landing;});
    let current = location.href.split("/")[3] == ""? "landing" : location.href.split("/")[3];

    const [loading, setLoading] = useState({state: true});
    const [error, setError] = useState({errorType: null, message: GetErrorMsg(null)});
    const [user, setUser] = useState({active: false, person: []});
    const [dashboard, setDash] = useState({active: false, el: null});
    const [popperOpen, setPO] = useState({active: false, anchorEl: null});
    const [navItems, setNavItems] = useState({selected: null, items: navorigins, guest: !auth.user? guestorigins : []});
    const [alerts, setAlerts] = useState(auth.alerts); // database finding later, if needed. not needed now, I don't think.
    const mobile = useWindowResizeThreshold(640);
    // const [api, contextHolder] = notification.useNotification();

    useEffect(()=>{
        // console.log(currentPage);
        // if (currentPage == navItems.selected.id) {
        //     setNavItems({...navItems, selected: landingNav[0].id});
        // }
        // console.log(children);
        console.log(alerts);
    }, []);

    // useEffect(()=>{
    //     const ni = document.getElementById(`nav-items`);
    //     console.log(window.innerWidth);
    //     if (window.innerWidth <= 640) {
    //         // ni.classList.add("nav-items-mobile");
    //         setMobile(true);
    //     }
    // }, []);

    const HandleClick = (e) => {
        switch (dashboard.active) {
            case true:
                setDash({active: false, el: null});
                break;
            case false:
                setDash({active: true, el: e.currentTarget});
                break;
            default:
                break;
        }
    }

    const LogoutClick = () => {
        Inertia.post(`/api/account/logout`, null, {method: `POST`, onFinish: () => {
            // setError({message: `You're now logged out.`, active: true, type: `info`});
            sparkNotification(`info`, `Wow`, `You're now logged out!`)
            setTimeout(()=>{Inertia.visit(`/`, {method: `GET`})}, 2000)
        }})
    } // <--- will change this later when I work on authentication.

    return(
        <>
        {/* <MUI.Menu onClose={(e)=>{setDash({active: false, el: null});}} anchorEl={dashboard.el} open={dashboard.active} className={`dashboard`} anchorOrigin={{vertical: 'bottom', horizontal: 'center'}} transformOrigin={{horizontal: 'center'}}>
            <MUI.MenuItem><Link href={`/dashboard`}>Dashboard</Link></MUI.MenuItem>
            <MUI.MenuItem><Link href={`/account/settings`}>Settings</Link></MUI.MenuItem>
            <MUI.Divider></MUI.Divider>
            <MUI.MenuItem><a onClick={(e)=>{e.preventDefault();LogoutClick();}}>Logout</a></MUI.MenuItem>
        </MUI.Menu>
        <MUI.Snackbar open={error.active} autoHideDuration={6000} onClose={(e)=>{setError({...error, active: false});}}>
            <MUI.Alert onClose={(e)=>{setError({...error, active: false});}} severity={error.type}>
                {error.message}
            </MUI.Alert>
        </MUI.Snackbar>
        {
        auth.user?
        <MUI.Popper placement={`bottom`} disablePortal={false} open={popperOpen.active} anchorEl={popperOpen.anchorEl} className={`dashboard`}>
            <p>You currently have {auth.user.bank} {currencyName}.</p>
        </MUI.Popper>
        :
        null
        } */}
        <>
        {
        option == "no-options"?
        null
        :
        <>
        <nav style={mobile? {minHeight: `9rem`} : null} class="main-nav absolute bg-gray-800/50 after:pointer-events-none after:absolute after:inset-x-0 after:bottom-0 after:h-px after:bg-white/10">
            <div class="mx-auto max-w-7xl px-2 sm:px-6 lg:px-8" style={mobile? {marginTop: `-2.5rem`} : null}>
                <div class="relative flex h-16 items-center justify-between">
                <div class="absolute inset-y-0 left-0 flex items-center sm:hidden">
                    <button type="button" command="--toggle" commandfor="mobile-menu" class="relative inline-flex items-center justify-center rounded-md p-2 text-gray-400 hover:bg-white/5 hover:text-white focus:outline-2 focus:-outline-offset-1 focus:outline-indigo-500">
                    <span class="absolute -inset-0.5"></span>
                    <span class="sr-only">Open main menu</span>
                    {/* <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" data-slot="icon" aria-hidden="true" class="size-6 in-aria-expanded:hidden">
                        <path d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25h16.5" stroke-linecap="round" stroke-linejoin="round" />
                    </svg> */}
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" data-slot="icon" aria-hidden="true" class="size-6 not-in-aria-expanded:hidden">
                        <path d="M6 18 18 6M6 6l12 12" stroke-linecap="round" stroke-linejoin="round" />
                    </svg>
                    </button>
                </div>
                {
                !mobile?
                <>
                <div class="flex flex-1 items-center items-center justify-center sm:items-stretch sm:justify-start">
                    <div class="flex shrink-0 items-center">
                        <img style={{marginRight: `1rem`}} src={publicImages.logo} alt={`logo`} class="h-12 w-auto" id={`nav-logo`} onClick={()=>{if (current != "landing") {return Inertia.replace(`/`);}}}/>
                    </div>
                    <div id={`nav-items`}>
                        <div class="flex space-x-4">
                            {
                            navItems.items.map((item)=>(
                                <>
                                <Link key={item.id} href={item.link} class={`nav-item ${current == item.id? "main-item-nav" : null} px-3 py-2 text-sm font-medium`}>{item.title}</Link>
                                </>
                            ))
                            }
                        </div>
                    </div>
                    <div id={`nav-items`} style={{marginLeft: `auto`}}>
                        <div class="flex space-x-4">
                            {
                            navItems.guest.map((item)=>(
                                <>
                                <Link style={{display: `flex`, fontSize: `.7rem`, alignItems: `center`}} key={item.id} href={item.link} class={`nav-item ${current == item.id? "main-item-nav" : null} px-3 py-2 text-sm font-medium`}>{item.title}</Link>
                                </>
                            ))
                            }
                        </div>
                    </div>
                </div>
                </>
                :
                <>
                <div class="flex flex-1 nav-mobile items-center items-center justify-center sm:items-stretch sm:justify-start">
                    <div class="flex shrink-0 items-center">
                        <img style={{marginBottom: `.5rem`}} src={publicImages.logo} alt={appName} class="h-12 w-auto" id={`nav-logo`} onClick={()=>{if (current != "landing") {return Inertia.replace(`/`);}}}/>
                    </div>
                    <div id={`nav-items`}>
                        <div class="flex space-x-4">
                            {
                            navItems.guest.map((item)=>(
                                <>
                                <Link style={{display: `flex`, fontSize: `.7rem`, alignItems: `center`}} key={item.id} href={item.link} class={`nav-item ${current == item.id? "main-item-nav" : null} px-3 py-2 text-sm font-medium`}>{item.title}</Link>
                                </>
                            ))
                            }
                        </div>
                    </div>
                    <div id={`nav-items`}>
                        <div class="flex space-x-4">
                            {
                            navItems.items.map((item)=>(
                                <>
                                <Link style={{display: `flex`, fontSize: `.7rem`, alignItems: `center`}} key={item.id} href={item.link} class={`nav-item ${current == item.id? "main-item-nav" : null} px-3 py-2 text-sm font-medium`}>{item.title}</Link>
                                </>
                            ))
                            }
                        </div>
                    </div>
                </div>

                </>
                }
                </div>
            </div>
            </nav>
            {
            alerts.length >= 1?
            <>
            {
            alerts.map((alert)=>(
                <>
                <div className={`alert alert-${alert.type}`}>
                    <span style={{marginRight: `.5rem`}}>{alert.emoji}</span>
                    <p style={{fontWeight: `800`, marginRight: `.5rem`}}>{alert.title}</p>
                    <p style={{fontSize: `.9rem`}}>{alert.body}</p>
                </div>
                </>
            ))
            }
            </>
            :
            null
            }
            </>
        }
        </>
        <USALProvider>
        <main class="relative mb-4 min-h-screen" id="root" style={{justifyContent: `start`}}>
            {contextHolder}
            {children}
        </main>
        </USALProvider>
        </>
    );
}

{/** There appears to be an error with fetching this page; Maybe you type it in wrong??? */}

// const appRoot = createRoot(document.getElementById(`root`))

// const quoteRoot = createRoot(document.getElementById(`qotd`))

// if (document.getElementById(`eimg-r`)) {
//     createRoot(document.getElementById(`eimg-r`)).render(<GetErrorImage/>);
// }

// if (document.getElementById(`utb`)) {
//     createRoot(document.getElementById(`utb`)).render(<UserToolbar/>);
// }

// if (document.getElementById(`qotd`)) {
//     quoteRoot.render(<QuoteOfDay/>);
// }

// if (document.getElementById('example')) {
//     appRoot.render(<Example/>);
// }

// if (document.getElementById(`createProject`)) {
//     appRoot.render(<CreateProject/>);
// }
