package com.openmed;

import android.app.Activity;
import android.content.Intent;
import android.os.Bundle;
import android.support.annotation.Nullable;
import android.util.Log;
import android.view.WindowManager;

import com.evollu.react.fcm.FIRMessagingPackage;
import com.RNFetchBlob.RNFetchBlobPackage;
import com.lugg.ReactNativeConfig.ReactNativeConfigPackage;
import com.facebook.reactnative.androidsdk.FBSDKPackage;
import com.smixx.fabric.FabricPackage;
import com.crashlytics.android.Crashlytics;
import io.fabric.sdk.android.Fabric;
import com.crashlytics.android.core.CrashlyticsCore;

import com.calendarevents.CalendarEventsPackage;
import com.reactnative.ivpusic.imagepicker.PickerPackage;
import com.airbnb.android.react.maps.MapsPackage;
import com.i18n.reactnativei18n.ReactNativeI18n;
import com.oblador.vectoricons.VectorIconsPackage;
import com.facebook.react.ReactPackage;
import com.facebook.soloader.SoLoader;
import com.BV.LinearGradient.LinearGradientPackage;

import com.facebook.CallbackManager;
import com.facebook.FacebookSdk;
import com.facebook.appevents.AppEventsLogger;

// import Branch and RNBranch
import io.branch.rnbranch.RNBranchPackage;
import io.branch.referral.Branch;
import io.branch.rnbranch.*;

import com.reactnativenavigation.controllers.ActivityCallbacks;
import com.reactnativenavigation.NavigationApplication;
import com.learnium.RNDeviceInfo.RNDeviceInfo;
import com.github.wumke.RNExitApp.RNExitAppPackage;
import com.dylanvann.fastimage.FastImageViewPackage;
import com.agontuk.RNFusedLocation.RNFusedLocationPackage;
import org.reactnative.camera.RNCameraPackage;
import fr.greweb.reactnativeviewshot.RNViewShotPackage;
import com.rt2zz.reactnativecontacts.ReactNativeContacts;
import com.tkporter.sendsms.SendSMSPackage;
import java.util.Arrays;
import java.util.List;
import com.reactlibrary.mailcompose.RNMailComposePackage; // Add this

public class MainApplication extends NavigationApplication {

  private static CallbackManager mCallbackManager = CallbackManager.Factory.create();

  protected static CallbackManager getCallbackManager() {
    return mCallbackManager;
  }

  @Override
  public boolean isDebug() {
    return BuildConfig.DEBUG;
  }

  @Nullable
  @Override
  public List<ReactPackage> createAdditionalReactPackages() {
    return Arrays.<ReactPackage>asList(
            new FIRMessagingPackage(),
            new RNFetchBlobPackage(),
            new ReactNativeConfigPackage(),
            new FBSDKPackage(mCallbackManager),
            new FabricPackage(),
            new CalendarEventsPackage(),
            new PickerPackage(),
            new MapsPackage(),
            new ReactNativeI18n(),
            new VectorIconsPackage(),
            new LinearGradientPackage(),
            new RNDeviceInfo(),
            new RNExitAppPackage(),
            new FastImageViewPackage(),
            new RNFusedLocationPackage(),
            new RNCameraPackage(),
            new RNViewShotPackage(),
            new ReactNativeContacts(),
            SendSMSPackage.getInstance(),
            new RNBranchPackage(),
             new RNMailComposePackage() // Add this
    );
  }

  @Override
  public void onCreate() {
    super.onCreate();

    Branch.getAutoInstance(this);

    // Initialize the SDK before executing any other operations.
    FacebookSdk.sdkInitialize(getApplicationContext());
    // Use AppEventsLogger to log custom events.
    AppEventsLogger.activateApp(this);

    Crashlytics crashlyticsKit = new Crashlytics.Builder()
            .core(new CrashlyticsCore.Builder().disabled(BuildConfig.DEBUG).build())
            .build();

    Fabric.with(this, crashlyticsKit);
    SoLoader.init(this, /* native exopackage */ false);

    final NavigationApplication sharedInstance = this;

    setActivityCallbacks(new ActivityCallbacks() {
      @Override
      public void onNewIntent(Intent intent) {
        super.onNewIntent(intent);
      }

      @Override
      public void onActivityStarted(Activity activity) {
        super.onActivityStarted(activity);
        RNBranchModule.initSession(activity.getIntent().getData(), activity);
      }

      @Override
      public void onActivityCreated(Activity activity, Bundle savedInstanceState) {
        super.onActivityCreated(activity, savedInstanceState);
        activity.getWindow().setSoftInputMode(WindowManager.LayoutParams.SOFT_INPUT_ADJUST_PAN);
      }

      @Override
      public void onActivityResult(int requestCode, int resultCode, Intent data) {
        if(requestCode==101) {
          super.onActivityResult(requestCode, resultCode, data);
        }else {
          mCallbackManager.onActivityResult(requestCode, resultCode, data);
          //probably some other stuff here
          SendSMSPackage.getInstance().onActivityResult(requestCode, resultCode, data);
        }
      }

      @Override
      public void onRequestPermissionsResult(int requestCode, String[] permissions, int[] grantResults) {
        CalendarEventsPackage.onRequestPermissionsResult(requestCode, permissions, grantResults);
        super.onRequestPermissionsResult(requestCode, permissions, grantResults);
      }
    });
  }
}
